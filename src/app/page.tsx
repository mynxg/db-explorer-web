"use client";

import { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Search, Database, Plus, X, RefreshCw, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ModeToggle } from "@/components/mode-toggle";
import { 
  databaseService, 
  ConnectionInfo, 
  TableInfo, 
  TableColumn, 
  TabData,
  ColumnDefinition,
  DataRow
} from '@/app/api/api';

export default function DatabasePage() {
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>({
    dbType: "MYSQL",
    ip: "localhost",
    port: 3306,
    username: "root",
    password: "123456",
    dbName: "ry-vue-ddd"
  });

  const [testingConnection, setTestingConnection] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [tableFilter, setTableFilter] = useState("");
  const [activeTab, setActiveTab] = useState("");
  const [tabs, setTabs] = useState<TabData[]>([]);
  const [tabIndex, setTabIndex] = useState(0);

  // 在组件顶部添加 useEffect 来加载保存的连接信息
  useEffect(() => {
    // 从 localStorage 加载连接信息
    const savedConnectionInfo = localStorage.getItem('connectionInfo');
    const savedConnected = localStorage.getItem('connected');
    
    if (savedConnectionInfo) {
      try {
        const parsedInfo = JSON.parse(savedConnectionInfo);
        setConnectionInfo(parsedInfo);
        
        // 如果之前已连接，自动重新连接
        if (savedConnected === 'true') {
          // 使用 setTimeout 确保组件完全挂载后再连接
          setTimeout(() => {
            handleAutoConnect(parsedInfo);
          }, 500);
        }
      } catch (error) {
        console.error('Failed to parse saved connection info:', error);
      }
    }
  }, []);

  // 添加自动连接处理函数
  const handleAutoConnect = async (connInfo: ConnectionInfo) => {
    setConnecting(true);
    try {
      const tables = await databaseService.getTables(connInfo);
      setTables(tables);
      setConnected(true);
      // 不显示成功提示，因为是自动连接
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }, message: string };
      console.error('自动连接失败', error);
      toast.error('自动连接失败: ' + (err.response?.data?.message || err.message));
      // 连接失败时清除保存的连接状态
      localStorage.removeItem('connected');
    } finally {
      setConnecting(false);
    }
  };

  // 修改 connect 函数，在成功连接后保存连接信息
  const connect = async () => {
    setConnecting(true);
    try {
      const tables = await databaseService.getTables(connectionInfo);
      setTables(tables);
      setConnected(true);
      toast.success('已连接到数据库，获取到 ' + tables.length + ' 个表');
      
      // 保存连接信息和连接状态到 localStorage
      localStorage.setItem('connectionInfo', JSON.stringify(connectionInfo));
      localStorage.setItem('connected', 'true');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }, message: string };
      console.error('连接数据库失败', error);
      toast.error('连接失败: ' + (err.response?.data?.message || err.message));
      
      // 连接失败时清除保存的连接状态
      localStorage.removeItem('connected');
    } finally {
      setConnecting(false);
    }
  };

  // 添加断开连接函数
  const disconnect = () => {
    setConnected(false);
    setTables([]);
    setTabs([]);
    setActiveTab('');
    
    // 清除保存的连接状态，但保留连接信息以便用户再次连接
    localStorage.removeItem('connected');
    
    toast.info('已断开数据库连接');
  };

  // 处理连接信息变更
  const handleConnectionChange = (field: string, value: any) => {
    setConnectionInfo({
      ...connectionInfo,
      [field]: field === "port" ? parseInt(value) : value
    });
  };

  // 测试数据库连接
  const testConnection = async () => {
    setTestingConnection(true);
    try {
      const result = await databaseService.testConnection(connectionInfo);
      if (result.success) {
        toast.success('连接成功');
      } else {
        toast.error(result.message || '连接失败');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }, message: string };
      console.error('测试连接失败', error);
      toast.error('连接失败: ' + (err.response?.data?.message || err.message));
    } finally {
      setTestingConnection(false);
    }
  };

  // 加载表结构
  const loadTableStructure = async (tableName: string) => {
    const tabIndex = tabs.findIndex(tab => tab.type === 'table' && tab.tableName === tableName);
    if (tabIndex === -1) return;
    
    try {
      // 更新loading状态
      const loadingTabs = [...tabs];
      loadingTabs[tabIndex] = {
        ...loadingTabs[tabIndex],
        loading: true
      };
      setTabs(loadingTabs);
      
      const columns = await databaseService.getTableStructure(connectionInfo, tableName);
      console.log('表结构响应:', columns);
      
      // 使用最新的tabs状态
      const updatedTabs = [...tabs];
      const newTabIndex = updatedTabs.findIndex(tab => tab.type === 'table' && tab.tableName === tableName);
      
      if (newTabIndex !== -1) {
        updatedTabs[newTabIndex] = {
          ...updatedTabs[newTabIndex],
          columns: columns,
          loading: false
        };
        setTabs([...updatedTabs]);
        
        // 加载完表结构后自动加载表数据
        loadTableData(tableName, 1);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }, message: string };
      console.error('加载表结构失败', error);
      toast.error('加载表结构失败: ' + (err.response?.data?.message || err.message));
      
      // 更新错误状态
      const errorTabs = [...tabs];
      const newTabIndex = errorTabs.findIndex(tab => tab.type === 'table' && tab.tableName === tableName);
      if (newTabIndex !== -1) {
        errorTabs[newTabIndex].loading = false;
        setTabs([...errorTabs]);
      }
    }
  };

  // 加载表数据
  const loadTableData = async (tableName: string, page: number) => {
    const tabIndex = tabs.findIndex(tab => tab.type === 'table' && tab.tableName === tableName);
    if (tabIndex === -1) return;
    
    const updatedTabs = [...tabs];
    updatedTabs[tabIndex].loading = true;
    updatedTabs[tabIndex].currentPage = page;
    setTabs(updatedTabs);
    
    try {
      const result = await databaseService.getTableData(
        connectionInfo, 
        tableName, 
        page, 
        updatedTabs[tabIndex].pageSize || 50
      );
      
      console.log('表数据响应:', result);
      
      // 更新标签页数据
      const newUpdatedTabs = [...tabs];
      const newTabIndex = newUpdatedTabs.findIndex(tab => tab.type === 'table' && tab.tableName === tableName);
      
      if (newTabIndex !== -1) {
        newUpdatedTabs[newTabIndex].data = result.data || [];
        newUpdatedTabs[newTabIndex].dataColumns = result.columns || [];
        newUpdatedTabs[newTabIndex].total = result.total || 0;
        newUpdatedTabs[newTabIndex].loading = false;
        setTabs([...newUpdatedTabs]);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }, message: string };
      console.error('加载表数据失败', error);
      toast.error('加载数据失败: ' + (err.response?.data?.message || err.message));
      
      const newUpdatedTabs = [...tabs];
      const newTabIndex = newUpdatedTabs.findIndex(tab => tab.type === 'table' && tab.tableName === tableName);
      if (newTabIndex !== -1) {
        newUpdatedTabs[newTabIndex].loading = false;
        setTabs([...newUpdatedTabs]);
      }
    }
  };

  // 创建新的SQL查询标签页
  const createSqlTab = () => {
    const tabName = `tab-${tabIndex}`;
    const newTab: TabData = {
      title: 'SQL查询',
      name: tabName,
      type: 'sql',
      sql: '',
      executing: false
    };
    
    setTabs([...tabs, newTab]);
    setActiveTab(tabName);
    setTabIndex(tabIndex + 1);
  };

  // 执行SQL查询
  const executeSql = async (tab: TabData) => {
    if (!tab.sql) {
      toast.error('请输入SQL语句');
      return;
    }
    
    const tabIndex = tabs.findIndex(t => t.name === tab.name);
    if (tabIndex === -1) return;
    
    const updatedTabs = [...tabs];
    updatedTabs[tabIndex].executing = true;
    setTabs(updatedTabs);
    
    try {
      const result = await databaseService.executeSql(connectionInfo, tab.sql);
      
      const newUpdatedTabs = [...tabs];
      const newTabIndex = newUpdatedTabs.findIndex(t => t.name === tab.name);
      if (newTabIndex !== -1) {
        newUpdatedTabs[newTabIndex].result = result;
        newUpdatedTabs[newTabIndex].executing = false;
        setTabs([...newUpdatedTabs]);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }, message: string };
      console.error('执行SQL失败', error);
      toast.error('执行失败: ' + (err.response?.data?.message || err.message));
      
      const newUpdatedTabs = [...tabs];
      const newTabIndex = newUpdatedTabs.findIndex(t => t.name === tab.name);
      if (newTabIndex !== -1) {
        newUpdatedTabs[newTabIndex].executing = false;
        setTabs([...newUpdatedTabs]);
      }
    }
  };

  // 关闭标签页
  const closeTab = (tabName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTabs(tabs.filter(tab => tab.name !== tabName));
    if (activeTab === tabName) {
      setActiveTab(tabs.length > 1 ? tabs[tabs.length - 2].name : '');
    }
  };

  // 点击表名
  const handleTableClick = (table: TableInfo) => {
    // 检查是否已经打开了这个表的标签页
    const existingTab = tabs.find(tab => tab.type === 'table' && tab.tableName === table.tableName);
    if (existingTab) {
      setActiveTab(existingTab.name);
      return;
    }
    
    // 创建新标签页
    const tabName = `tab-${tabIndex}`;
    const newTab: TabData = {
      title: table.tableName,
      name: tabName,
      type: 'table',
      tableName: table.tableName,
      columns: table.columns || [],
      activeSubTab: 'structure',
      data: [],
      dataColumns: [],
      currentPage: 1,
      pageSize: 50,
      total: 0,
      loading: false
    };
    
    setTabs([...tabs, newTab]);
    setActiveTab(tabName);
    setTabIndex(tabIndex + 1);
    
    // 加载表结构
    loadTableStructure(table.tableName);
  };

  // 过滤表格
  const filteredTables = tableFilter 
    ? tables.filter(table => table.tableName.toLowerCase().includes(tableFilter.toLowerCase()))
    : tables;

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* 顶部导航栏 */}
      <header className="border-b border-border h-14 px-4 flex items-center justify-between sticky top-0 z-10 bg-background">
        <div className="flex items-center space-x-4">
          <Database className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">数据库查询工具</h1>
        </div>
        <div className="flex items-center space-x-2">
          {connected && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
              已连接: {connectionInfo.dbName}@{connectionInfo.ip}
            </Badge>
          )}
          <ModeToggle />
        </div>
      </header>
      
      {/* 主内容区 - 始终保持左侧边栏可见 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧边栏 - 始终显示 */}
        <div className="w-64 border-r border-border flex flex-col overflow-hidden">
          {!connected ? (
            <div className="p-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">数据库连接</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm mb-1 text-muted-foreground">数据库类型</label>
                      <Select 
                        value={connectionInfo.dbType} 
                        onValueChange={(value) => handleConnectionChange('dbType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择数据库类型" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MYSQL">MySQL</SelectItem>
                          <SelectItem value="POSTGRESQL">PostgreSQL</SelectItem>
                          <SelectItem value="ORACLE">Oracle</SelectItem>
                          <SelectItem value="SQLSERVER">SQL Server</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm mb-1 text-muted-foreground">IP地址</label>
                      <Input 
                        value={connectionInfo.ip} 
                        onChange={(e) => handleConnectionChange('ip', e.target.value)}
                        placeholder="例如: localhost" 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm mb-1 text-muted-foreground">端口</label>
                      <Input 
                        type="number" 
                        value={connectionInfo.port} 
                        onChange={(e) => handleConnectionChange('port', e.target.value)}
                        placeholder="例如: 3306" 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm mb-1 text-muted-foreground">用户名</label>
                      <Input 
                        value={connectionInfo.username} 
                        onChange={(e) => handleConnectionChange('username', e.target.value)}
                        placeholder="例如: root" 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm mb-1 text-muted-foreground">密码</label>
                      <Input 
                        type="password" 
                        value={connectionInfo.password} 
                        onChange={(e) => handleConnectionChange('password', e.target.value)}
                        placeholder="输入密码" 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm mb-1 text-muted-foreground">数据库名</label>
                      <Input 
                        value={connectionInfo.dbName} 
                        onChange={(e) => handleConnectionChange('dbName', e.target.value)}
                        placeholder="例如: mysql" 
                      />
                    </div>
                    
                    <div className="flex space-x-2 mt-4">
                      <Button 
                        onClick={testConnection} 
                        variant="outline" 
                        disabled={testingConnection}
                      >
                        {testingConnection ? '测试中...' : '测试连接'}
                      </Button>
                      
                      {!connected ? (
                        <Button 
                          onClick={connect} 
                          disabled={connecting}
                        >
                          {connecting ? '连接中...' : '连接'}
                        </Button>
                      ) : (
                        <Button 
                          onClick={disconnect} 
                          variant="destructive"
                        >
                          断开连接
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="搜索表..."
                    className="pl-8"
                    value={tableFilter}
                    onChange={(e) => setTableFilter(e.target.value)}
                  />
                </div>
              </div>
              
              <ScrollArea className="flex-1">
                <div className="p-2">
                  {filteredTables.length > 0 ? (
                    <ul className="space-y-1">
                      {filteredTables.map((table) => (
                        <li key={table.tableName}>
                          <button
                            onClick={() => handleTableClick(table)}
                            className="w-full text-left px-3 py-2 rounded-md hover:bg-accent flex items-center text-sm"
                          >
                            <Database className="h-4 w-4 mr-2 text-muted-foreground" />
                            {table.tableName}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      {tableFilter ? '没有找到匹配的表' : '没有表'}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </>
          )}
        </div>
        
        {/* 右侧内容区 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {connected && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="border-b border-border p-2">
                <div className="flex items-center">
                  {tabs.length > 0 ? (
                    <>
                      <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="flex-1"
                      >
                        <TabsList className="h-9 bg-background border border-input rounded-md p-1 justify-start">
                          {tabs.map((tab) => (
                            <TabsTrigger
                              key={tab.name}
                              value={tab.name}
                              className="relative px-3 py-1.5 text-sm font-medium border-r border-input last:border-r-0 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-none first:rounded-l-sm last:rounded-r-sm"
                            >
                              <span className="mr-6">{tab.title}</span>
                              <button
                                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 rounded-full hover:bg-muted p-0.5"
                                onClick={(e) => closeTab(tab.name, e)}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </TabsTrigger>
                          ))}
                        </TabsList>
                      </Tabs>
                    </>
                  ) : (
                    <div className="flex-1 text-sm text-muted-foreground">
                      没有打开的标签页
                    </div>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={createSqlTab}
                    className="ml-2 h-9"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    新建查询
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 overflow-auto p-4">
                {tabs.map((tab) => (
                  <div key={tab.name} className={activeTab === tab.name ? 'block h-full' : 'hidden'}>
                    {tab.type === 'table' && (
                      <Tabs
                        value={tab.activeSubTab}
                        onValueChange={(value) => {
                          const updatedTabs = [...tabs];
                          const index = updatedTabs.findIndex(t => t.name === tab.name);
                          updatedTabs[index].activeSubTab = value;
                          setTabs(updatedTabs);
                          
                          if (value === 'structure' && (!tab.columns || tab.columns.length === 0)) {
                            loadTableStructure(tab.tableName!);
                          } else if (value === 'data' && (!tab.data || tab.data.length === 0)) {
                            loadTableData(tab.tableName!, 1);
                          }
                        }}
                        className="h-full"
                      >
                        <TabsList>
                          <TabsTrigger value="structure">表结构</TabsTrigger>
                          <TabsTrigger value="data">表数据</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="structure" className="mt-4">
                          <Card>
                            <CardHeader className="py-3 border-b flex flex-row items-center">
                              <div className="flex items-center flex-nowrap">
                                <span className="text-base font-medium mr-1">表结构</span>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-7 w-7 text-muted-foreground hover:text-foreground flex-shrink-0" 
                                  onClick={() => loadTableStructure(tab.tableName!)}
                                >
                                  <RefreshCw className="h-4 w-4" />
                                  <span className="sr-only">刷新</span>
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="p-0">
                              {tab.loading ? (
                                <div className="flex items-center justify-center py-12 text-muted-foreground">
                                  加载中...
                                </div>
                              ) : tab.columns && tab.columns.length > 0 ? (
                                <>
                                  <div className="overflow-x-auto">
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>字段名</TableHead>
                                          <TableHead>类型</TableHead>
                                          <TableHead>可空</TableHead>
                                          <TableHead>键</TableHead>
                                          <TableHead>默认值</TableHead>
                                          <TableHead>额外</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {tab.columns.map((column, i) => (
                                          <TableRow key={i}>
                                            <TableCell className="font-medium">
                                              {column.columnName || column.name || column.field || '未知字段'}
                                            </TableCell>
                                            <TableCell>
                                              {column.typeName || column.dataType || column.type || '未知类型'}
                                            </TableCell>
                                            <TableCell>
                                              {column.nullable === true || column.isNullable === true || column.nullAble === 'YES' 
                                                ? 'YES' 
                                                : column.nullable === false || column.isNullable === false || column.nullAble === 'NO'
                                                  ? 'NO'
                                                  : '-'}
                                            </TableCell>
                                            <TableCell>
                                              {column.key || (column.primaryKey ? 'PRI' : '-')}
                                            </TableCell>
                                            <TableCell>
                                              {column.default !== null && column.default !== undefined 
                                                ? String(column.default)
                                                : column.defaultValue !== null && column.defaultValue !== undefined
                                                  ? String(column.defaultValue)
                                                  : <span className="text-muted-foreground italic">null</span>}
                                            </TableCell>
                                            <TableCell>
                                              {column.extra || column.comment || column.remarks || '-'}
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                  <div className="p-2 text-xs text-muted-foreground">
                                    共 {tab.columns?.length || 0} 个字段
                                  </div>
                                </>
                              ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                  <p>没有表结构数据</p>
                                  <pre className="mt-4 text-xs bg-muted p-2 rounded">
                                    {JSON.stringify(tab, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </TabsContent>
                        
                        <TabsContent value="data" className="mt-4">
                          <Card>
                            <CardHeader className="py-3 border-b flex flex-row items-center">
                              <div className="flex items-center flex-nowrap">
                                <span className="text-base font-medium mr-1">表数据</span>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-7 w-7 text-muted-foreground hover:text-foreground flex-shrink-0" 
                                  onClick={() => loadTableData(tab.tableName!, tab.currentPage!)}
                                >
                                  <RefreshCw className="h-4 w-4" />
                                  <span className="sr-only">刷新</span>
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent className="p-0">
                              {(tab.dataColumns?.length ?? 0) > 0 ? (
                                <div className="overflow-x-auto">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        {tab.dataColumns?.map((column: ColumnDefinition, i: number) => (
                                          <TableHead key={i}>{column.name}</TableHead>
                                        ))}
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {tab.data?.map((row: DataRow, i: number) => (
                                        <TableRow key={i}>
                                          {tab.dataColumns?.map((column: ColumnDefinition, j: number) => (
                                            <TableCell key={j}>
                                              {row[column.name] !== null && row[column.name] !== undefined 
                                                ? String(row[column.name]) 
                                                : <span className="text-muted-foreground italic">null</span>}
                                            </TableCell>
                                          ))}
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center py-12 text-muted-foreground">
                                  {tab.loading ? '加载中...' : '没有数据'}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </TabsContent>
                      </Tabs>
                    )}
                    
                    {tab.type === 'sql' && (
                      <div className="h-full">
                        <Card className="mb-4">
                          <CardHeader className="py-3">
                            <CardTitle className="text-base">SQL查询</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="mb-4">
                              <textarea
                                className="w-full h-32 p-3 rounded-md border border-input bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                                placeholder="SELECT * FROM table_name WHERE condition"
                                value={tab.sql}
                                onChange={(e) => {
                                  const updatedTabs = [...tabs];
                                  const index = updatedTabs.findIndex(t => t.name === tab.name);
                                  updatedTabs[index].sql = e.target.value;
                                  setTabs(updatedTabs);
                                }}
                              />
                            </div>
                            <Button 
                              onClick={() => executeSql(tab)}
                              disabled={tab.executing}
                            >
                              {tab.executing ? (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                  执行中
                                </>
                              ) : (
                                <>
                                  <Play className="h-4 w-4 mr-2" />
                                  执行
                                </>
                              )}
                            </Button>
                          </CardContent>
                        </Card>
                        
                        {tab.dataColumns && (tab.result?.columns?.length ?? 0) > 0 ? (
                          <Card>
                            <CardHeader className="py-3">
                              <CardTitle className="text-base">查询结果</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                              <div className="overflow-x-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      {tab.result?.columns.map((column: any, i: number) => (
                                        <TableHead key={i}>{column.name}</TableHead>
                                      ))}
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {tab.result?.data.map((row: any, i: number) => (
                                      <TableRow key={i}>
                                        {tab.result?.columns.map((column: any, j: number) => (
                                          <TableCell key={j}>
                                            {row[column.name] !== null && row[column.name] !== undefined 
                                              ? String(row[column.name]) 
                                              : <span className="text-muted-foreground italic">null</span>}
                                          </TableCell>
                                        ))}
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </CardContent>
                          </Card>
                        ) : (
                          <div className="flex items-center justify-center py-12 text-muted-foreground">
                            没有数据
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                
                {activeTab === '' && (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Database className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>点击左侧表名查看数据，或点击右上角 + 按钮创建SQL查询</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {!connected && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Database className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                <h2 className="text-xl font-medium mb-2">请先连接数据库</h2>
                <p className="text-muted-foreground">使用左侧表单连接到数据库</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 