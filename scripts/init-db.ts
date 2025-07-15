import 'dotenv/config'
import { initializeDatabase } from '../lib/db'
import { logger } from '../lib/logger'

async function main() {
  try {
    logger.debug('Initializing database...')
    await initializeDatabase()
    logger.debug('Database initialization complete!')
    process.exit(0)
  } catch (error) {
    console.error('Failed to initialize database:', error)
    process.exit(1)
  }
}

main()
