import { RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TabData, ColumnDefinition, DataRow, TableColumn } from '@/app/api/api';

interface TableViewProps {
  tab: TabData;
  onTabUpdate: (updatedTab: Partial<TabData>) => void;
  onLoadTableStructure: (tableName: string) => void;
  onLoadTableData: (tableName: string, page: number) => void;
}

export function TableView({ 
  tab, 
  onTabUpdate, 
  onLoadTableStructure, 
  onLoadTableData 
}: TableViewProps) {
  
  // 处理标签切换的函数
  const handleTabChange = (value: string) => {
    // 只更新选项卡状态，数据加载通过handleTabUpdate中的逻辑处理
    onTabUpdate({ activeSubTab: value });
  };

  // 处理页面改变
  const handlePageChange = (newPage: number) => {
    onLoadTableData(tab.tableName!, newPage);
  };

  // 处理每页记录数改变
  const handlePageSizeChange = (newSize: number) => {
    // 更新标签状态
    onTabUpdate({ pageSize: newSize });
    
    // 直接使用新的页面大小加载数据，跳转到第一页
    onLoadTableData(tab.tableName!, 1, undefined, newSize);
  };

  return (
    <Tabs
      value={tab.activeSubTab}
      onValueChange={handleTabChange}
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
                onClick={() => onLoadTableStructure(tab.tableName!)}
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
                      {tab.columns.map((column: TableColumn, i: number) => (
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
                onClick={() => onLoadTableData(tab.tableName!, tab.currentPage || 1)}
              >
                <RefreshCw className="h-4 w-4" />
                <span className="sr-only">刷新</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {(tab.dataColumns?.length ?? 0) > 0 ? (
              <>
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

                {/* 添加分页控件 */}
                <div className="flex items-center justify-between border-t p-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">共 {tab.total || 0} 条记录</span>
                    
                    {/* 每页记录数选择器移到这里 */}
                    <div className="flex items-center ml-4">
                      <span className="text-sm text-muted-foreground mr-2">每页</span>
                      <Select
                        value={String(tab.pageSize || 50)}
                        onValueChange={(value) => handlePageSizeChange(Number(value))}
                      >
                        <SelectTrigger className="h-8 w-16">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                          <SelectItem value="200">200</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-sm text-muted-foreground ml-2">条</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(1)}
                      disabled={tab.loading || (tab.currentPage || 1) <= 1}
                    >
                      首页
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange((tab.currentPage || 1) - 1)}
                      disabled={tab.loading || (tab.currentPage || 1) <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1">
                      <span className="text-sm">第</span>
                      <input
                        type="number"
                        min={1}
                        max={Math.ceil((tab.total || 0) / (tab.pageSize || 50))}
                        value={tab.currentPage || 1}
                        onChange={(e) => {
                          const page = Number(e.target.value);
                          if (page >= 1 && page <= Math.ceil((tab.total || 0) / (tab.pageSize || 50))) {
                            handlePageChange(page);
                          }
                        }}
                        className="w-12 h-8 text-center border rounded-md"
                      />
                      <span className="text-sm">/ {Math.ceil((tab.total || 0) / (tab.pageSize || 50))} 页</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange((tab.currentPage || 1) + 1)}
                      disabled={tab.loading || (tab.currentPage || 1) >= Math.ceil((tab.total || 0) / (tab.pageSize || 50))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(Math.ceil((tab.total || 0) / (tab.pageSize || 50)))}
                      disabled={tab.loading || (tab.currentPage || 1) >= Math.ceil((tab.total || 0) / (tab.pageSize || 50))}
                    >
                      末页
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
  );
} 