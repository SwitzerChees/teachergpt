import { connectRedis } from './jobs'
import { connectBull } from './jobs/bull'

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  async register({ strapi }) {
    const { role } = strapi.config.server
    strapi.log.info(`Server Role: ${role}`)
    await connectRedis(strapi)
    await connectBull(strapi)
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap(/* { strapi } */) {},
}
