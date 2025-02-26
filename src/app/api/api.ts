import axios from 'axios';

// 从环境变量获取基础URL配置
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8076/api';

// ==================== 类型定义 ====================

// 数据库连接信息
export interface ConnectionInfo {
  dbType: string;
  ip: string;
  port: number;
  username: string;
  password: string;
  dbName: string;
}

// 表列定义
export interface TableColumn {
  // 可能的字段名称变体
  name?: string;
  columnName?: string;
  field?: string;
  
  // 可能的类型名称变体
  type?: string;
  dataType?: string;
  typeName?: string;
  
  // 可能的可空标志变体
  nullable?: boolean;
  isNullable?: boolean;
  nullAble?: string;
  
  // 可能的键标志变体
  key?: string;
  primaryKey?: boolean;
  isPrimary?: boolean;
  
  // 可能的默认值变体
  default?: string | null;
  defaultValue?: string | null;
  
  // 可能的额外信息变体
  extra?: string;
  comment?: string;
  remarks?: string;
}

// 表信息
export interface TableInfo {
  tableName: string;
  columns?: TableColumn[];
}

// 表数据响应
export interface TableDataResponse {
  data: Record<string, any>[];  // 表数据数组
  columns: { name: string }[];  // 列信息数组
  total: number;               // 总记录数
  page?: number;               // 当前页码
  pageSize?: number;           // 每页记录数
}

// SQL执行结果
export interface SqlExecutionResult {
  columns: { name: string }[];  // 列信息
  data: Record<string, any>[];  // 数据
  hasMore?: boolean;           // 是否有更多数据
  sql?: string;                // 执行的SQL
  error?: string;              // 错误信息
}

// 标签页数据类型
export interface TabData {
  title: string;
  name: string;
  type: 'table' | 'sql';
  tableName?: string;
  columns?: TableColumn[];
  activeSubTab?: string;
  data?: any[];
  dataColumns?: any[];
  currentPage?: number;
  pageSize?: number;
  total?: number;
  loading?: boolean;
  sql?: string;
  result?: SqlExecutionResult;
  executing?: boolean;
}

// 测试连接响应
export interface TestConnectionResponse {
  success: boolean;
  message?: string;
}

// 添加这些接口
export interface ColumnDefinition {
  name: string;
  dataType?: string;
  type?: string;
  [key: string]: any; // 如果有更多未知属性
}

export interface DataRow {
  [columnName: string]: string | number | boolean | null;
}

// ==================== API客户端配置 ====================

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// 请求拦截器
apiClient.interceptors.request.use(
  config => {
    // 可以在这里添加认证信息等
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // 统一处理错误
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// ==================== 数据库服务 ====================

export const databaseService = {
  // 测试数据库连接
  testConnection: async (connectionInfo: ConnectionInfo): Promise<TestConnectionResponse> => {
    try {
      const response = await apiClient.post('/database/test-connection', connectionInfo);
      return response.data;
    } catch (error) {
      console.error('Test connection failed:', error);
      throw error;
    }
  },

  // 获取数据库表列表
  getTables: async (connectionInfo: ConnectionInfo): Promise<TableInfo[]> => {
    try {
      const response = await apiClient.post('/database/tables', connectionInfo);
      return response.data;
    } catch (error) {
      console.error('Get tables failed:', error);
      throw error;
    }
  },

  // 获取表结构
  getTableStructure: async (connectionInfo: ConnectionInfo, tableName: string): Promise<TableColumn[]> => {
    try {
      const response = await apiClient.post('/database/table-structure', {
        ...connectionInfo,
        tableName
      });
      return response.data;
    } catch (error) {
      console.error('Get table structure failed:', error);
      throw error;
    }
  },

  // 获取表数据
  getTableData: async (
    connectionInfo: ConnectionInfo, 
    tableName: string, 
    page: number, 
    pageSize: number
  ): Promise<TableDataResponse> => {
    try {
      const response = await apiClient.post(
        `/database/query?tableName=${tableName}&page=${page}&pageSize=${pageSize}`,
        connectionInfo
      );
      return response.data;
    } catch (error) {
      console.error('Get table data failed:', error);
      throw error;
    }
  },

  // 执行SQL查询
  executeSql: async (connectionInfo: ConnectionInfo, sql: string): Promise<SqlExecutionResult> => {
    try {
      // 将sql作为URL查询参数，将connectionInfo作为请求体
      const response = await apiClient.post(
        `/database/execute?sql=${encodeURIComponent(sql)}`,
        connectionInfo
      );
   
      return response.data;
    } catch (error) {
      console.error('Execute SQL failed:', error);
      throw error;
    }
  }
};

// ==================== 其他服务 ====================

// 用户服务
export const userService = {
  // 用户相关API
};

// 文件服务
export const fileService = {
  // 文件相关API
};

// 导出默认API客户端，用于自定义请求
export default apiClient; 