"use client";

import { useState } from "react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ModeToggle } from "@/components/mode-toggle";
import { ConnectionPanel } from "./ConnectionPanel";
import { TableList } from "./TableList";
import { TabsPanel } from "./TabsPanel";
import { cn } from "@/lib/utils";

export interface TableColumn {
  name: string;
  type: string;
  nullable: boolean;
  key: string;
  default: string | null;
  extra: string;
}

export interface TableInfo {
  tableName: string;
  columns: TableColumn[];
}

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
  result?: any;
  executing?: boolean;
}

export interface ConnectionInfo {
  dbType: string;
  ip: string;
  port: number;
  username: string;
  password: string;
  dbName: string;
}

export function DatabaseQueryTool() {
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>({
    dbType: "MYSQL",
    ip: "localhost",
    port: 3306,
    username: "root",
    password: "",
    dbName: "test"
  });

  const [connected, setConnected] = useState(false);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [activeTab, setActiveTab] = useState("");
  const [tabs, setTabs] = useState<TabData[]>([]);
  const [tabIndex, setTabIndex] = useState(0);

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
      
      {/* 主内容区 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧边栏 */}
        <div className={cn(
          "w-80 border-r border-border flex flex-col overflow-hidden transition-all duration-300",
          !connected && "w-full"
        )}>
          {!connected ? (
            <ConnectionPanel 
              connectionInfo={connectionInfo}
              setConnectionInfo={setConnectionInfo}
              setConnected={setConnected}
              setTables={setTables}
            />
          ) : (
            <TableList 
              tables={tables}
              tableClick={(table) => {
                // 处理表点击逻辑
                const existingTab = tabs.find(tab => tab.type === 'table' && tab.tableName === table.tableName);
                if (existingTab) {
                  setActiveTab(existingTab.name);
                  return;
                }
                
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
              }}
            />
          )}
        </div>
        
        {/* 右侧内容区 */}
        {connected && (
          <div className="flex-1 overflow-hidden">
            <TabsPanel 
              tabs={tabs}
              setTabs={setTabs}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              tabIndex={tabIndex}
              setTabIndex={setTabIndex}
              connectionInfo={connectionInfo}
            />
          </div>
        )}
      </div>
    </div>
  );
} 