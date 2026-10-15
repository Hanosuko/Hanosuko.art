// Онлайн Minecraft-сервера напрямую по протоколу Server List Ping — без mcsrvstat.us,
// который кеширует ответ на 5 минут и без VPN из РФ отвечает через раз.
// Модуль общий: его использует server/index.js и dev-плагин Vite (vite-plugins/server-status-dev-api.ts).

import { Socket } from 'node:net'
import { resolveSrv } from 'node:dns/promises'

// Тот же адрес, что profile.server.address; другой — через переменную MC_SERVER_ADDRESS
export const DEFAULT_ADDRESS = 'cisprac.xyz'
const DEFAULT_PORT = 25565
const TIMEOUT_MS = 5_000
const CACHE_TTL_MS = 30_000

const varInt = (value) => {
  const bytes = []
  let rest = value >>> 0
  do {
    let byte = rest & 0x7f
    rest >>>= 7
    if (rest !== 0) byte |= 0x80
    bytes.push(byte)
  } while (rest !== 0)
  return Buffer.from(bytes)
}

// null — в буфере ещё не весь VarInt
const readVarInt = (buffer, offset) => {
  let value = 0
  for (let i = 0; i < 5; i++) {
    if (offset + i >= buffer.length) return null
    const byte = buffer[offset + i]
    value |= (byte & 0x7f) << (7 * i)
    if ((byte & 0x80) === 0) return { value, size: i + 1 }
  }
  throw new Error('VarInt is too big')
}

const packet = (...parts) => {
  const body = Buffer.concat(parts)
  return Buffer.concat([varInt(body.length), body])
}

const mcString = (text) => {
  const bytes = Buffer.from(text, 'utf8')
  return Buffer.concat([varInt(bytes.length), bytes])
}

// Как сам клиент: сначала SRV-запись _minecraft._tcp, потом A-запись и порт по умолчанию
const resolveTarget = async (address) => {
  const [host, port] = address.split(':')
  if (port) return { host, port: Number(port) }
  try {
    const [record] = await resolveSrv(`_minecraft._tcp.${host}`)
    if (record) return { host: record.name, port: record.port }
  } catch {
    // SRV-записи нет — обычная ситуация
  }
  return { host, port: DEFAULT_PORT }
}

const ping = (address, host, port) =>
  new Promise((resolve, reject) => {
    const socket = new Socket()
    let received = Buffer.alloc(0)

    const fail = (error) => {
      socket.destroy()
      reject(error)
    }

    socket.setTimeout(TIMEOUT_MS, () => fail(new Error(`${address} did not answer in ${TIMEOUT_MS} ms`)))
    socket.once('error', fail)

    socket.connect(port, host, () => {
      const portBytes = Buffer.alloc(2)
      portBytes.writeUInt16BE(port)
      // Handshake (протокол -1 — «любой», следующее состояние 1 — статус), затем Status Request
      socket.write(packet(varInt(0x00), varInt(-1), mcString(address.split(':')[0]), portBytes, varInt(1)))
      socket.write(packet(varInt(0x00)))
    })

    socket.on('data', (chunk) => {
      received = Buffer.concat([received, chunk])
      try {
        const length = readVarInt(received, 0)
        if (!length || received.length < length.size + length.value) return
        let offset = length.size
        offset += readVarInt(received, offset).size // id пакета
        const json = readVarInt(received, offset)
        offset += json.size
        const status = JSON.parse(received.subarray(offset, offset + json.value).toString('utf8'))
        socket.destroy()
        resolve(status)
      } catch (error) {
        fail(error)
      }
    })
  })

// Ответ в формате mcsrvstat.us (только нужные фронтенду поля), чтобы фронтенд мог переключаться между ними
export const createServerStatusClient = ({ address = DEFAULT_ADDRESS } = {}) => {
  let cached = null
  let pending = null

  const load = async () => {
    try {
      const { host, port } = await resolveTarget(address)
      const status = await ping(address, host, port)
      return {
        online: true,
        icon: typeof status.favicon === 'string' ? status.favicon : undefined,
        players: { online: Number(status.players?.online ?? 0), max: Number(status.players?.max ?? 0) },
      }
    } catch (error) {
      console.warn('[server-status]', error instanceof Error ? error.message : error)
      return { online: false }
    }
  }

  const get = async () => {
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.body
    // Одновременные запросы ждут один и тот же пинг
    pending ??= load().then((body) => {
      cached = { at: Date.now(), body }
      pending = null
      return body
    })
    return pending
  }

  return { get }
}
