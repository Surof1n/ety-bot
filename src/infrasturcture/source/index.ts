import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { EtyGuildDb } from '../guilds/contracts'
import { MemberAuthProcessDb } from '../member-auth-process/contracts'
import { EtyMemberDb } from '../members/contracts'

const dataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [EtyMemberDb, EtyGuildDb, MemberAuthProcessDb],
  synchronize: true,
  entitySkipConstructor: true,
  useUTC: true,
  logging: false
})

export { dataSource }
