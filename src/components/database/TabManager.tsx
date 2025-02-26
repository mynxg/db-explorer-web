import { Plus, X, Database, XCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TabData } from '@/app/api/api';
import { TableView } from "./TableView";
import { SqlEditor } from "./SqlEditor";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TabManagerProps {
  tabs: TabData[];
  activeTab: string;
  onActiveTabChange: (tabName: string) => void;
  onTabClose: (tabName: string, e: React.MouseEvent) => void;
  onCreateSqlTab: () => void;
  onTabUpdate: (tabName: string, updatedTab: Partial<TabData>) => void;
  onLoadTableStructure: (tableName: string) => void;
  onLoadTableData: (tableName: string, page: number) => void;
  onExecuteSql: (tab: TabData) => void;
  onCloseAllTabs?: () => void;
}

export function TabManager({
  tabs,
  activeTab,
  onActiveTabChange,
  onTabClose,
  onCreateSqlTab,
  onTabUpdate,
  onLoadTableStructure,
  onLoadTableData,
  onExecuteSql,
  onCloseAllTabs
}: TabManagerProps) {
  
  const handleTabUpdate = (tabName: string) => {
    return (updatedTab: Partial<TabData>) => {
      onTabUpdate(tabName, updatedTab);
    };
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* 标签头部区域 - 采用固定高度并添加水平滚动 */}
      <div className="border-b border-border flex items-center h-12">
        {/* 标签滚动区域 */}
        <div className="flex-1 overflow-x-auto scrollbar-hide">
          <div className="flex min-w-max">
            {tabs.map(tab => (
              <div 
                key={tab.name}
                className={`flex items-center px-4 h-12 border-r border-border whitespace-nowrap cursor-pointer ${
                  activeTab === tab.name ? 'bg-background border-b-2 border-b-primary text-primary' : 'text-muted-foreground hover:bg-accent'
                }`}
                onClick={() => onActiveTabChange(tab.name)}
              >
                <span className="mr-2">{tab.title}</span>
                <button
                  onClick={(e) => onTabClose(tab.name, e)}
                  className="rounded-full p-0.5 hover:bg-accent-foreground/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* 右侧固定按钮区域 */}
        <div className="flex-shrink-0 border-l border-border flex">
          {/* 关闭所有标签按钮 - 仅当有标签时显示 */}
          {tabs.length > 0 && onCloseAllTabs && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="px-3 h-12 rounded-none text-muted-foreground hover:text-destructive"
                    onClick={onCloseAllTabs}
                  >
                    <XCircle className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>关闭所有标签</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {/* 新建查询按钮 */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="px-3 h-12 rounded-none"
                  onClick={onCreateSqlTab}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>新建SQL查询</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {/* 标签内容区域 */}
      <div className="flex-1 overflow-auto p-4">
        {tabs.map(tab => (
          <div 
            key={tab.name}
            className={`h-full ${activeTab === tab.name ? 'block' : 'hidden'}`}
          >
            {tab.type === 'table' && (
              <TableView 
                tab={tab}
                onTabUpdate={handleTabUpdate(tab.name)}
                onLoadTableStructure={onLoadTableStructure}
                onLoadTableData={onLoadTableData}
              />
            )}
            
            {tab.type === 'sql' && (
              <SqlEditor 
                tab={tab}
                onTabUpdate={handleTabUpdate(tab.name)}
                onExecuteSql={onExecuteSql}
              />
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