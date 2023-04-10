export default defineNuxtRouteMiddleware(async (to) => {
  const user = useStrapiUser()
  // Load static token if in development
  const runtimeConfig = useRuntimeConfig()
  if (!user.value && runtimeConfig.staticToken && process.env.NODE_ENV === 'development') {
    await sleep(3)
    const { setToken, fetchUser } = useStrapiAuth()
    setToken(runtimeConfig.staticToken)
    await fetchUser()
    return redirectLastPage()
  }
  // Redirect to login if not logged in
  if (!user.value && !(to.name === 'login' || to.name === 'registration')) {
    useCookie('redirect', { path: '/' }).value = to.fullPath
    return navigateTo('/login')
  }
  // Redirect to home or last page if logged in and trying to access login
  if (user.value && to.name === 'login') {
    return redirectLastPage()
  }
})

const redirectLastPage = () => {
  const cookie = useCookie('redirect', { path: '/' })
  if (cookie.value) {
    const redirect = cookie.value
    return navigateTo(redirect)
  }
  return navigateTo('/')
}

const sleep = (seconds: number) => {
  return new Promise((resolve) => setTimeout(resolve, Math.floor(seconds * 1000)))
}
