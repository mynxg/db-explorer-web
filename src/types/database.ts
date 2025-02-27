/**
 * 数据库类型枚举
 */
export enum DatabaseType {
  MYSQL = 'MYSQL',
  ORACLE = 'ORACLE',
  POSTGRESQL = 'POSTGRESQL',
  SQLSERVER = 'SQLSERVER',
  DB2 = 'DB2',
  SQLITE = 'SQLITE',
  MARIADB = 'MARIADB',
  H2 = 'H2',
  HIVE = 'HIVE',
  CLICKHOUSE = 'CLICKHOUSE'
}

/**
 * 数据库类型配置
 */
export interface DatabaseTypeConfig {
  label: string;
  defaultPort: number;
  icon?: string; // 可以后续添加每种数据库的图标
}

/**
 * 数据库类型配置映射
 */
export const DATABASE_CONFIG: Record<DatabaseType, DatabaseTypeConfig> = {
  [DatabaseType.MYSQL]: {
    label: 'MySQL',
    defaultPort: 3306
  },
  [DatabaseType.ORACLE]: {
    label: 'Oracle',
    defaultPort: 1521
  },
  [DatabaseType.POSTGRESQL]: {
    label: 'PostgreSQL',
    defaultPort: 5432
  },
  [DatabaseType.SQLSERVER]: {
    label: 'SQL Server',
    defaultPort: 1433
  },
  [DatabaseType.DB2]: {
    label: 'DB2',
    defaultPort: 50000
  },
  [DatabaseType.SQLITE]: {
    label: 'SQLite',
    defaultPort: 0 // SQLite 是文件数据库，不需要端口
  },
  [DatabaseType.MARIADB]: {
    label: 'MariaDB',
    defaultPort: 3306
  },
  [DatabaseType.H2]: {
    label: 'H2',
    defaultPort: 9092
  },
  [DatabaseType.HIVE]: {
    label: 'Hive',
    defaultPort: 10000
  },
  [DatabaseType.CLICKHOUSE]: {
    label: 'ClickHouse',
    defaultPort: 8123
  }
}; 