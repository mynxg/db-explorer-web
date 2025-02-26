import { useState } from "react";
import { toast } from 'react-toastify';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { databaseService, ConnectionInfo } from '@/app/api/api';

interface ConnectionPanelProps {
  connectionInfo: ConnectionInfo;
  onConnectionInfoChange: (field: string, value: any) => void;
  onConnect: () => Promise<void>;
  onDisconnect: () => void;
  connecting: boolean;
  connected: boolean;
  savedConnections: ConnectionInfo[];
  onSwitchConnection: (conn: ConnectionInfo) => Promise<void>;
}

export function ConnectionPanel({
  connectionInfo,
  onConnectionInfoChange,
  onConnect,
  onDisconnect,
  connecting,
  connected,
  savedConnections,
  onSwitchConnection
}: ConnectionPanelProps) {
  const [testingConnection, setTestingConnection] = useState(false);

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

  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle className="text-lg">数据库连接</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-muted-foreground">数据库类型</label>
            <Select
              value={connectionInfo.dbType}
              onValueChange={(value) => onConnectionInfoChange('dbType', value)}
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
            <label className="block text-sm mb-1 text-muted-foreground">主机地址</label>
            <Input 
              value={connectionInfo.ip} 
              onChange={(e) => onConnectionInfoChange('ip', e.target.value)}
              placeholder="例如: localhost" 
            />
          </div>
          
          <div>
            <label className="block text-sm mb-1 text-muted-foreground">端口</label>
            <Input 
              type="number" 
              value={connectionInfo.port.toString()} 
              onChange={(e) => onConnectionInfoChange('port', e.target.value)}
              placeholder="例如: 3306" 
            />
          </div>
          
          <div>
            <label className="block text-sm mb-1 text-muted-foreground">用户名</label>
            <Input 
              value={connectionInfo.username} 
              onChange={(e) => onConnectionInfoChange('username', e.target.value)}
              placeholder="例如: root" 
            />
          </div>
          
          <div>
            <label className="block text-sm mb-1 text-muted-foreground">密码</label>
            <Input 
              type="password" 
              value={connectionInfo.password} 
              onChange={(e) => onConnectionInfoChange('password', e.target.value)}
              placeholder="输入密码" 
            />
          </div>
          
          <div>
            <label className="block text-sm mb-1 text-muted-foreground">数据库名</label>
            <Input 
              value={connectionInfo.dbName} 
              onChange={(e) => onConnectionInfoChange('dbName', e.target.value)}
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
                onClick={onConnect} 
                disabled={connecting}
              >
                {connecting ? '连接中...' : '连接'}
              </Button>
            ) : (
              <Button 
                onClick={onDisconnect} 
                variant="destructive"
              >
                断开连接
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 