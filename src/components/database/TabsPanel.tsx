"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import { Plus, X, Database, RefreshCw, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TabData, ConnectionInfo, TableColumn } from "./DatabaseQueryTool";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TabsPanelProps {
  tabs: TabData[];
  setTabs: (tabs: TabData[]) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabIndex: number;
  setTabIndex: (index: number) => void;
  connectionInfo: ConnectionInfo;
}

export function TabsPanel({ 
  tabs, 
  setTabs, 
  activeTab, 
  setActiveTab, 
  tabIndex, 
  setTabIndex,
  connectionInfo
}: TabsPanelProps) {
  
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
  
  // 关闭标签页
  const closeTab = (tabName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTabs(tabs.filter(tab => tab.name !== tabName));
    if (activeTab === tabName) {
      setActiveTab(tabs.length > 1 ? tabs[tabs.length - 2].name : '');
    }
  };
  
  // 加载表结构
  const loadTableStructure = async (tableName: string) => {
    const tabIndex = tabs.findIndex(tab => tab.type === 'table' && tab.tableName === tableName);
    if (tabIndex === -1) return;
    
    try {
      const response = await axios.post('http://localhost:8080/api/database/table-structure', {
        ...connectionInfo,
        tableName
      });
      
      const columns = response.data;
      
      const updatedTabs = [...tabs];
      updatedTabs[tabIndex].columns = columns;
      setTabs(updatedTabs);
    } catch (error: any) {
      console.error('加载表结构失败', error);
      toast.error('加载表结构失败: ' + (error.response?.data?.message || error.message));
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
      const response = await axios.post('http://localhost:8080/api/database/table-data', {
        ...connectionInfo,
        tableName,
        page,
        pageSize: updatedTabs[tabIndex].pageSize
      });
      
      const result = response.data;
      
      const newUpdatedTabs = [...tabs];
      newUpdatedTabs[tabIndex].data = result.data;
      newUpdatedTabs[tabIndex].dataColumns = result.columns;
      newUpdatedTabs[tabIndex].total = result.total;
      newUpdatedTabs[tabIndex].loading = false;
      setTabs(newUpdatedTabs);
    } catch (error: any) {
      console.error('加载表数据失败', error);
      toast.error('加载数据失败: ' + (error.response?.data?.message || error.message));
      
      const newUpdatedTabs = [...tabs];
      newUpdatedTabs[tabIndex].loading = false;
      setTabs(newUpdatedTabs);
    }
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
      const response = await axios.post('http://localhost:8080/api/database/execute-sql', {
        ...connectionInfo,
        sql: tab.sql
      });
      
      const result = response.data;
      
      const newUpdatedTabs = [...tabs];
      newUpdatedTabs[tabIndex].result = result;
      newUpdatedTabs[tabIndex].executing = false;
      setTabs(newUpdatedTabs);
    } catch (error: any) {
      console.error('执行SQL失败', error);
      toast.error('执行失败: ' + (error.response?.data?.message || error.message));
      
      const newUpdatedTabs = [...tabs];
      newUpdatedTabs[tabIndex].executing = false;
      setTabs(newUpdatedTabs);
    }
  };

  // 当活动标签页变化时，确保加载表结构
  useEffect(() => {
    if (activeTab) {
      const tab = tabs.find(t => t.name === activeTab);
      if (tab && tab.type === 'table' && tab.tableName && (!tab.columns || tab.columns.length === 0)) {
        loadTableStructure(tab.tableName);
      }
    }
  }, [activeTab, tabs]);

  return (
    <div className="flex flex-col h-full">
      {/* 标签页头部 */}
      <div className="border-b border-border flex items-center">
        <div className="flex-1 overflow-x-auto">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                className={`flex items-center px-4 py-2 border-r border-border text-sm ${
                  activeTab === tab.name 
                    ? 'bg-background text-foreground font-medium' 
                    : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
                }`}
                onClick={() => setActiveTab(tab.name)}
              >
                {tab.title}
                <button
                  className="ml-2 text-muted-foreground hover:text-foreground"
                  onClick={(e) => closeTab(tab.name, e)}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </button>
            ))}
          </div>
        </div>
        <div className="p-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8"
            onClick={createSqlTab}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* 标签页内容 */}
      <div className="flex-1 overflow-hidden">
        {tabs.map((tab) => (
          <div
            key={tab.name}
            className={`h-full overflow-auto p-4 ${activeTab === tab.name ? 'block' : 'hidden'}`}
          >
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
                className="h-full flex flex-col"
              >
                <TabsList className="mb-4">
                  <TabsTrigger value="structure">表结构</TabsTrigger>
                  <TabsTrigger value="data">表数据</TabsTrigger>
                </TabsList>
                
                <TabsContent value="structure" className="flex-1 mt-0">
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-base flex items-center justify-between">
                        <span>表结构: {tab.tableName}</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => loadTableStructure(tab.tableName!)}
                          className="h-8"
                        >
                          <RefreshCw className="h-3.5 w-3.5 mr-1" />
                          刷新
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      {tab.columns && tab.columns.length > 0 ? (
                        <ScrollArea className="max-h-[calc(100vh-220px)]">
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
                                  <TableCell className="font-medium">{column.name}</TableCell>
                                  <TableCell>{column.type}</TableCell>
                                  <TableCell>{column.nullable ? 'YES' : 'NO'}</TableCell>
                                  <TableCell>{column.key}</TableCell>
                                  <TableCell>
                                    {column.default !== null && column.default !== undefined 
                                      ? column.default 
                                      : <span className="text-muted-foreground italic">null</span>}
                                  </TableCell>
                                  <TableCell>{column.extra}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      ) : (
                        <div className="flex items-center justify-center py-12 text-muted-foreground">
                          加载中...
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="data" className="flex-1 mt-0">
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-base flex items-center justify-between">
                        <span>表数据: {tab.tableName}</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => loadTableData(tab.tableName!, tab.currentPage || 1)}
                          className="h-8"
                        >
                          <RefreshCw className="h-3.5 w-3.5 mr-1" />
                          刷新
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      {tab.data && tab.data.length > 0 && tab.dataColumns && tab.dataColumns.length > 0 ? (
                        <>
                          <ScrollArea className="max-h-[calc(100vh-280px)]">
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    {tab.dataColumns?.map((column: any, i: number) => (
                                      <TableHead key={i}>{column.name}</TableHead>
                                    ))}
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {tab.data.map((row: any, i: number) => (
                                    <TableRow key={i}>
                                      {tab.dataColumns?.map((column: any, j: number) => (
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
                          </ScrollArea>
                          
                          <div className="flex items-center justify-between p-4 border-t">
                            <div>总计 {tab.total} 条记录</div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={tab.currentPage! <= 1}
                                onClick={() => loadTableData(tab.tableName!, tab.currentPage! - 1)}
                              >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                上一页
                              </Button>
                              <span className="text-sm">
                                第 <span className="font-medium">{tab.currentPage}</span> 页
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={tab.currentPage! * tab.pageSize! >= tab.total!}
                                onClick={() => loadTableData(tab.tableName!, tab.currentPage! + 1)}
                              >
                                下一页
                                <ChevronRight className="h-4 w-4 ml-1" />
                              </Button>
                            </div>
                          </div>
                        </>
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
              <div className="h-full flex flex-col">
                <Card className="mb-4">
                  <CardHeader className="pb-2">
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
                
                {tab.result && (
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-base">查询结果</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      {tab.result.columns && tab.result.columns.length > 0 ? (
                        <ScrollArea className="max-h-[calc(100vh-380px)]">
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  {tab.result.columns.map((column: any, i: number) => (
                                    <TableHead key={i}>{column.name}</TableHead>
                                  ))}
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {tab.result.data.map((row: any, i: number) => (
                                  <TableRow key={i}>
                                    {tab.result.columns.map((column: any, j: number) => (
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
                        </ScrollArea>
                      ) : (
                        <div className="flex items-center justify-center py-12 text-muted-foreground">
                          没有数据
                        </div>
                      )}
                    </CardContent>
                  </Card>
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
  );
} 