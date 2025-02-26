"use client";

import { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Database, ChevronDown } from "lucide-react";
import { databaseService, ConnectionInfo, TableInfo, TabData } from '@/app/api/api';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ModeToggle } from "@/components/mode-toggle";
import { ConnectionPanel } from "@/components/database/ConnectionPanel";
import { TableList } from "@/components/database/TableList";
import { TabManager } from "@/components/database/TabManager";

export default function DatabasePage() {
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>({
    dbType: "MYSQL",
    ip: "localhost",
    port: 3306,
    username: "root",
    password: "123456",
    dbName: "ry-vue-ddd"
  });

  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [activeTab, setActiveTab] = useState("");
  const [tabs, setTabs] = useState<TabData[]>([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [savedConnections, setSavedConnections] = useState<ConnectionInfo[]>([]);

  // 加载保存的连接信息
  useEffect(() => {
    const savedConnectionInfo = localStorage.getItem('connectionInfo');
    const savedConnected = localStorage.getItem('connected');
    const savedConnectionsHistory = localStorage.getItem('connectionsHistory');
    
    // 加载连接历史
    if (savedConnectionsHistory) {
      try {
        const connections = JSON.parse(savedConnectionsHistory);
        setSavedConnections(connections);
      } catch (error) {
        console.error('Failed to parse connections history:', error);
      }
    }
    
    // 加载当前连接
    if (savedConnectionInfo) {
      try {
        const parsedInfo = JSON.parse(savedConnectionInfo);
        setConnectionInfo(parsedInfo);
        
        // 如果之前已连接，自动重新连接
        if (savedConnected === 'true') {
          setTimeout(() => {
            handleAutoConnect(parsedInfo);
          }, 500);
        }
      } catch (error) {
        console.error('Failed to parse saved connection info:', error);
      }
    }
  }, []);

  // 自动连接处理函数
  const handleAutoConnect = async (connInfo: ConnectionInfo) => {
    setConnecting(true);
    try {
      const tables = await databaseService.getTables(connInfo);
      setTables(tables);
      setConnected(true);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }, message: string };
      console.error('自动连接失败', error);
      toast.error('自动连接失败: ' + (err.response?.data?.message || err.message));
      localStorage.removeItem('connected');
    } finally {
      setConnecting(false);
    }
  };

  // 保存连接到历史记录
  const saveConnectionToHistory = (conn: ConnectionInfo) => {
    const exists = savedConnections.some(
      c => c.dbName === conn.dbName && c.ip === conn.ip && c.port === conn.port
    );
    
    if (!exists) {
      const newConnections = [conn, ...savedConnections.slice(0, 9)]; // 最多保存10个
      setSavedConnections(newConnections);
      localStorage.setItem('connectionsHistory', JSON.stringify(newConnections));
    }
  };

  // 连接到数据库
  const connect = async () => {
    setConnecting(true);
    try {
      const tables = await databaseService.getTables(connectionInfo);
      setTables(tables);
      setConnected(true);
      toast.success('已连接到数据库，获取到 ' + tables.length + ' 个表');
      
      localStorage.setItem('connectionInfo', JSON.stringify(connectionInfo));
      localStorage.setItem('connected', 'true');
      
      saveConnectionToHistory(connectionInfo);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }, message: string };
      console.error('连接数据库失败', error);
      toast.error('连接失败: ' + (err.response?.data?.message || err.message));
      
      localStorage.removeItem('connected');
    } finally {
      setConnecting(false);
    }
  };

  // 断开连接
  const disconnect = () => {
    setConnected(false);
    setTables([]);
    setTabs([]);
    setActiveTab('');
    
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

  // 处理选项卡更新时先缓存要更新的值，确保不会被异步操作覆盖
  const handleTabUpdate = (tabName: string, updatedTabData: Partial<TabData>) => {
    const tabIndex = tabs.findIndex(tab => tab.name === tabName);
    if (tabIndex === -1) return;
    
    // 特别处理activeSubTab以确保选项卡切换的稳定性
    if (updatedTabData.activeSubTab) {
      const targetSubTab = updatedTabData.activeSubTab;
      
      setTabs(prevTabs => {
        const newTabs = [...prevTabs];
        const currentTabIndex = newTabs.findIndex(tab => tab.name === tabName);
        
        if (currentTabIndex !== -1) {
          // 确保保留其他属性的同时更新activeSubTab
          newTabs[currentTabIndex] = {
            ...newTabs[currentTabIndex],
            activeSubTab: targetSubTab
          };
          
          // 如果切换到data标签但没有数据，安排数据加载
          if (targetSubTab === 'data' && 
              newTabs[currentTabIndex].type === 'table' && 
              (!newTabs[currentTabIndex].data || newTabs[currentTabIndex].data.length === 0) && 
              !newTabs[currentTabIndex].loading) {
            
            // 标记为loading但不直接调用加载函数
            // 加载函数将通过副作用单独调用
            newTabs[currentTabIndex].loading = true;
            
            // 使用setTimeout延迟执行，确保状态更新完成后再加载数据
            setTimeout(() => {
              const tableName = newTabs[currentTabIndex].tableName!;
              loadTableData(tableName, 1, targetSubTab);
            }, 0);
          }
          
          // 同理，如果切换到structure标签但没有结构数据，安排加载
          if (targetSubTab === 'structure' && 
              newTabs[currentTabIndex].type === 'table' && 
              (!newTabs[currentTabIndex].columns || newTabs[currentTabIndex].columns.length === 0) && 
              !newTabs[currentTabIndex].loading) {
            
            newTabs[currentTabIndex].loading = true;
            
            setTimeout(() => {
              const tableName = newTabs[currentTabIndex].tableName!;
              loadTableStructure(tableName, targetSubTab);
            }, 0);
          }
        }
        
        return newTabs;
      });
    } else {
      // 处理其他更新（非activeSubTab的更新）
      setTabs(prevTabs => {
        const newTabs = [...prevTabs];
        const currentTabIndex = newTabs.findIndex(tab => tab.name === tabName);
        
        if (currentTabIndex !== -1) {
          newTabs[currentTabIndex] = {
            ...newTabs[currentTabIndex],
            ...updatedTabData
          };
        }
        
        return newTabs;
      });
    }
  };

  // 修改loadTableStructure和loadTableData函数，添加一个targetSubTab参数
  const loadTableStructure = async (tableName: string, targetSubTab?: string) => {
    const tabIndex = tabs.findIndex(tab => tab.type === 'table' && tab.tableName === tableName);
    if (tabIndex === -1) return;
    
    // 获取当前的活动子选项卡，如果提供了目标选项卡则使用它
    const currentActiveSubTab = targetSubTab || tabs[tabIndex].activeSubTab;
    
    try {
      // 更新标签页为加载状态，但保留当前的activeSubTab
      setTabs(prevTabs => {
        const newTabs = [...prevTabs];
        const currIndex = newTabs.findIndex(tab => tab.type === 'table' && tab.tableName === tableName);
        
        if (currIndex !== -1) {
          newTabs[currIndex] = {
            ...newTabs[currIndex],
            loading: true,
            activeSubTab: currentActiveSubTab // 确保活动子选项卡不变
          };
        }
        
        return newTabs;
      });
      
      // 加载数据
      const columns = await databaseService.getTableStructure(connectionInfo, tableName);
      
      // 更新完成后的状态，同样保留activeSubTab
      setTabs(prevTabs => {
        const newTabs = [...prevTabs];
        const currIndex = newTabs.findIndex(tab => tab.type === 'table' && tab.tableName === tableName);
        
        if (currIndex !== -1) {
          newTabs[currIndex] = {
            ...newTabs[currIndex],
            columns: columns,
            loading: false,
            activeSubTab: currentActiveSubTab // 再次确保活动子选项卡不变
          };
        }
        
        return newTabs;
      });
      
      // 如果当前在表结构选项卡，且不是手动切换到表数据选项卡，才加载表数据
      if (currentActiveSubTab === 'structure' && !targetSubTab) {
        loadTableData(tableName, 1);
      }
    } catch (error) {
      // 处理错误...
      const err = error as { response?: { data?: { message?: string } }, message: string };
      console.error('加载表结构失败', error);
      toast.error('加载表结构失败: ' + (err.response?.data?.message || err.message));
      
      // 即使发生错误，也要保留activeSubTab
      setTabs(prevTabs => {
        const newTabs = [...prevTabs];
        const currIndex = newTabs.findIndex(tab => tab.type === 'table' && tab.tableName === tableName);
        
        if (currIndex !== -1) {
          newTabs[currIndex] = {
            ...newTabs[currIndex],
            loading: false,
            activeSubTab: currentActiveSubTab
          };
        }
        
        return newTabs;
      });
    }
  };

  const loadTableData = async (tableName: string, page: number, targetSubTab?: string, newPageSize?: number) => {
    const tabIndex = tabs.findIndex(tab => tab.type === 'table' && tab.tableName === tableName);
    if (tabIndex === -1) return;
    
    // 获取当前的活动子选项卡，如果提供了目标选项卡则使用它
    const currentActiveSubTab = targetSubTab || tabs[tabIndex].activeSubTab;
    
    // 使用新提供的页面大小或当前标签的页面大小
    const effectivePageSize = newPageSize || tabs[tabIndex].pageSize || 50;
    
    // 更新标签页为加载状态，但保留当前的activeSubTab
    setTabs(prevTabs => {
      const newTabs = [...prevTabs];
      const currIndex = newTabs.findIndex(tab => tab.type === 'table' && tab.tableName === tableName);
      
      if (currIndex !== -1) {
        newTabs[currIndex] = {
          ...newTabs[currIndex],
          loading: true,
          currentPage: page,
          pageSize: effectivePageSize, // 更新pageSize
          activeSubTab: currentActiveSubTab // 确保活动子选项卡不变
        };
      }
      
      return newTabs;
    });
    
    try {
      const result = await databaseService.getTableData(
        connectionInfo, 
        tableName, 
        page, 
        effectivePageSize // 使用effectivePageSize而不是tabs[tabIndex].pageSize
      );
      
      // 更新完成后的状态，同样保留activeSubTab
      setTabs(prevTabs => {
        const newTabs = [...prevTabs];
        const currIndex = newTabs.findIndex(tab => tab.type === 'table' && tab.tableName === tableName);
        
        if (currIndex !== -1) {
          newTabs[currIndex] = {
            ...newTabs[currIndex],
            data: result.data || [],
            dataColumns: result.columns || [],
            total: result.total || 0,
            loading: false,
            activeSubTab: currentActiveSubTab // 再次确保活动子选项卡不变
          };
        }
        
        return newTabs;
      });
    } catch (error) {
      // 处理错误...
      const err = error as { response?: { data?: { message?: string } }, message: string };
      console.error('加载表数据失败', error);
      toast.error('加载数据失败: ' + (err.response?.data?.message || err.message));
      
      // 即使发生错误，也要保留activeSubTab
      setTabs(prevTabs => {
        const newTabs = [...prevTabs];
        const currIndex = newTabs.findIndex(tab => tab.type === 'table' && tab.tableName === tableName);
        
        if (currIndex !== -1) {
          newTabs[currIndex] = {
            ...newTabs[currIndex],
            loading: false,
            activeSubTab: currentActiveSubTab
          };
        }
        
        return newTabs;
      });
    }
  };

  // 创建新的SQL查询标签页
  const createSqlTab = () => {
    // 限制最大标签数为10
    const MAX_TABS = 10;
    let newTabs = [...tabs];
    
    if (newTabs.length >= MAX_TABS) {
      const oldestTableTab = newTabs.findIndex(tab => tab.type === 'table');
      if (oldestTableTab !== -1) {
        newTabs.splice(oldestTableTab, 1);
      } else {
        newTabs.shift();
      }
      toast.info('已达到标签页上限，自动关闭最早打开的标签页');
    }
    
    const tabName = `tab-${tabIndex}`;
    const newTab: TabData = {
      title: `SQL查询-${tabIndex}`,
      name: tabName,
      type: 'sql',
      sql: '',
      executing: false
    };
    
    setTabs([...newTabs, newTab]);
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
    
    // 限制最大标签数为10
    const MAX_TABS = 10;
    let newTabs = [...tabs];
    
    // 如果超过最大标签数，关闭最早打开的标签
    if (newTabs.length >= MAX_TABS) {
      // 移除最早的标签（注意保留SQL标签）
      const oldestTableTab = newTabs.findIndex(tab => tab.type === 'table');
      if (oldestTableTab !== -1) {
        newTabs.splice(oldestTableTab, 1);
      } else {
        // 如果没有table类型的标签，移除最早的SQL标签
        newTabs.shift();
      }
      toast.info('已达到标签页上限，自动关闭最早打开的标签页');
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
    
    setTabs([...newTabs, newTab]);
    setActiveTab(tabName);
    setTabIndex(tabIndex + 1);
    
    // 加载表结构
    loadTableStructure(table.tableName);
  };

  // 切换数据库连接
  const switchConnection = async (conn: ConnectionInfo) => {
    if (connected) {
      // 如果选择的是当前连接，不做任何操作
      if (conn.dbName === connectionInfo.dbName && conn.ip === connectionInfo.ip && conn.port === conn.port) {
        return;
      }
      
      // 先断开当前连接
      setConnected(false);
      setTables([]);
      
      // 设置新的连接信息
      setConnectionInfo(conn);
      
      // 连接到新数据库
      setConnecting(true);
      try {
        const tables = await databaseService.getTables(conn);
        setTables(tables);
        setConnected(true);
        
        // 更新存储的连接信息
        localStorage.setItem('connectionInfo', JSON.stringify(conn));
        localStorage.setItem('connected', 'true');
        
        toast.success('已切换到数据库: ' + conn.dbName);
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } }, message: string };
        toast.error('切换数据库失败: ' + (err.response?.data?.message || err.message));
      } finally {
        setConnecting(false);
      }
    }
  };

  // 在DatabasePage组件中添加关闭所有标签的函数
  const closeAllTabs = () => {
    setTabs([]);
    setActiveTab('');
  };

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                    已连接: {connectionInfo.dbName}@{connectionInfo.ip}
                  </Badge>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>切换数据库</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {savedConnections.map((conn, idx) => (
                  <DropdownMenuItem 
                    key={idx}
                    onClick={() => switchConnection(conn)}
                    className={conn.dbName === connectionInfo.dbName && conn.ip === connectionInfo.ip ? "bg-accent" : ""}
                  >
                    <Database className="h-4 w-4 mr-2" />
                    {conn.dbName}@{conn.ip}
                  </DropdownMenuItem>
                ))}
                {savedConnections.length > 0 && <DropdownMenuSeparator />}
                <DropdownMenuItem onClick={disconnect}>
                  <Database className="h-4 w-4 mr-2" />
                  断开连接
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <ModeToggle />
        </div>
      </header>
      
      {/* 主内容区 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧边栏 */}
        <div className="w-64 border-r border-border flex flex-col overflow-hidden">
          {!connected ? (
            <div className="p-4">
              <ConnectionPanel 
                connectionInfo={connectionInfo}
                onConnectionInfoChange={handleConnectionChange}
                onConnect={connect}
                onDisconnect={disconnect}
                connecting={connecting}
                connected={connected}
                savedConnections={savedConnections}
                onSwitchConnection={switchConnection}
              />
            </div>
          ) : (
            <TableList 
              tables={tables}
              onTableClick={handleTableClick}
            />
          )}
        </div>
        
        {/* 右侧内容区 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {connected ? (
            <TabManager 
              tabs={tabs}
              activeTab={activeTab}
              onActiveTabChange={setActiveTab}
              onTabClose={closeTab}
              onCreateSqlTab={createSqlTab}
              onTabUpdate={handleTabUpdate}
              onLoadTableStructure={loadTableStructure}
              onLoadTableData={loadTableData}
              onExecuteSql={executeSql}
              onCloseAllTabs={closeAllTabs}
            />
          ) : (
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