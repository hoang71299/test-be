import fs from 'fs'
import path from 'path'
import z from 'zod'
import { config } from 'dotenv'

// 1. Nạp biến môi trường từ file .env nếu có
config({
  path: '.env'
})

// 2. Chỉ kiểm tra file .env khi đang chạy local
const checkEnv = async () => {
  const chalk = (await import('chalk')).default
  const isLocal = !process.env.PRODUCTION_URL && process.env.NODE_ENV !== 'production'

  if (isLocal && !fs.existsSync(path.resolve('.env'))) {
    console.log(chalk.red(`❌ Không tìm thấy file môi trường .env`))
    process.exit(1)
  }
}
checkEnv()

// 3. Validate biến môi trường với Zod
const configSchema = z.object({
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRES_IN: z.string(),
  GUEST_ACCESS_TOKEN_EXPIRES_IN: z.string(),
  GUEST_REFRESH_TOKEN_EXPIRES_IN: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.string(),
  INITIAL_EMAIL_OWNER: z.string(),
  INITIAL_PASSWORD_OWNER: z.string(),
  DOMAIN: z.string().optional(), // không bắt buộc khi deploy
  PROTOCOL: z.string().optional(), // không bắt buộc khi deploy
  UPLOAD_FOLDER: z.string(),
  CLIENT_URL: z.string().url(),
  GOOGLE_REDIRECT_CLIENT_URL: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_AUTHORIZED_REDIRECT_URI: z.string().optional(),
  PRODUCTION: z.enum(['true', 'false']).transform((val) => val === 'true'),
  DOCKER: z.enum(['true', 'false']).transform((val) => val === 'true'),
  PRODUCTION_URL: z.string().url(),
  SERVER_TIMEZONE: z.string()
})

const configServer = configSchema.safeParse(process.env)

if (!configServer.success) {
  console.error(configServer.error.issues)
  throw new Error('❌ Các giá trị khai báo trong file môi trường không hợp lệ.')
}

const envConfig = configServer.data

export const API_URL = envConfig.PRODUCTION
  ? envConfig.PRODUCTION_URL
  : `${envConfig.PROTOCOL || 'http'}://${envConfig.DOMAIN || 'localhost'}:${envConfig.PORT}`

export default envConfig

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof configSchema> { }
  }
}
