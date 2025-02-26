import { RefreshCw, Play } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TabData } from '@/app/api/api';

interface SqlEditorProps {
  tab: TabData;
  onTabUpdate: (updatedTab: Partial<TabData>) => void;
  onExecuteSql: (tab: TabData) => void;
}

export function SqlEditor({ tab, onTabUpdate, onExecuteSql }: SqlEditorProps) {
  return (
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
              onChange={(e) => onTabUpdate({ sql: e.target.value })}
            />
          </div>
          <Button 
            onClick={() => onExecuteSql(tab)}
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
      
      {tab.result && tab.result.columns && tab.result.columns.length > 0 ? (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base">查询结果</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
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
                      {tab.result && tab.result.columns && tab.result.columns.map((column: any, j: number) => (
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
  );
} 