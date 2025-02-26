import { RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
                onClick={() => onLoadTableData(tab.tableName!, tab.currentPage!)}
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
  );
} 