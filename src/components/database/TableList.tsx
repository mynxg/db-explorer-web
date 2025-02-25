"use client";

import { useState } from "react";
import { Search, Database } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TableInfo } from "./DatabaseQueryTool";

interface TableListProps {
  tables: TableInfo[];
  tableClick: (table: TableInfo) => void;
}

export function TableList({ tables, tableClick }: TableListProps) {
  const [tableFilter, setTableFilter] = useState("");
  
  // 过滤表格
  const filteredTables = tableFilter 
    ? tables.filter(table => table.tableName.toLowerCase().includes(tableFilter.toLowerCase()))
    : tables;

  return (
    <div className="flex flex-col h-full">
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
                    onClick={() => tableClick(table)}
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
    </div>
  );
} 