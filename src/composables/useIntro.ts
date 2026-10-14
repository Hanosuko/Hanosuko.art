import { readonly, ref } from 'vue'

// Заставка «click to me» закрыта — всё, что должно быть увидено (эффект профиля), стартует после неё
const entered = ref(false)

export function useIntro() {
  return {
    entered: readonly(entered),
    enter: (): void => {
      entered.value = true
    },
  }
}
