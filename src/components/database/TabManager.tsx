import { Plus, X, Database } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TabData } from '@/app/api/api';
import { TableView } from "./TableView";
import { SqlEditor } from "./SqlEditor";

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
  onExecuteSql
}: TabManagerProps) {

  const handleTabUpdate = (tabName: string) => (updatedTab: Partial<TabData>) => {
    onTabUpdate(tabName, updatedTab);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="border-b border-border p-2">
        <div className="flex items-center">
          {tabs.length > 0 ? (
            <>
              <Tabs
                value={activeTab}
                onValueChange={onActiveTabChange}
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
                        onClick={(e) => onTabClose(tab.name, e)}
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
            onClick={onCreateSqlTab}
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