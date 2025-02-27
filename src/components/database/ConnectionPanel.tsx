import { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { databaseService, ConnectionInfo } from '@/app/api/api';
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, EyeOff, Eye } from "lucide-react";
import { DatabaseType, DATABASE_CONFIG } from '@/types/database';

interface ConnectionPanelProps {
  connectionInfo: ConnectionInfo;
  onConnectionInfoChange: (field: string, value: any) => void;
  onConnect: (rememberConnection: boolean) => void;
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
  const [rememberConnection, setRememberConnection] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedDbType, setSelectedDbType] = useState(connectionInfo.dbType);

  useEffect(() => {
    setSelectedDbType(connectionInfo.dbType);
  }, [connectionInfo.dbType]);

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

  const handleConnect = () => {
    onConnect(rememberConnection);
  };

  const handleDbTypeChange = (value: string) => {
    setSelectedDbType(value as DatabaseType);
    onConnectionInfoChange('dbType', value);
    onConnectionInfoChange('port', DATABASE_CONFIG[value as DatabaseType].defaultPort);
  };

  return (
    <Card className="max-w-full">
      <CardHeader className="py-1">
        <CardTitle className="text-lg">数据库连接</CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="space-y-2 max-w-full">
          <div className="space-y-1">
            <Label htmlFor="dbType">数据库类型</Label>
            <Select 
              value={selectedDbType} 
              onValueChange={handleDbTypeChange}
              disabled={connecting}
            >
              <SelectTrigger id="dbType">
                <SelectValue>
                  {DATABASE_CONFIG[selectedDbType as DatabaseType]?.label || '选择数据库类型'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DATABASE_CONFIG).map(([type, config]) => (
                  <SelectItem key={type} value={type}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* SQLite 不需要显示主机地址和端口 */}
          {connectionInfo.dbType !== DatabaseType.SQLITE && (
            <>
              <div className="space-y-1">
                <Label htmlFor="hostname">主机地址</Label>
                <Input 
                  id="hostname"
                  value={connectionInfo.ip} 
                  onChange={(e) => onConnectionInfoChange('ip', e.target.value)}
                  placeholder="例如: localhost" 
                  disabled={connecting}
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="port">端口</Label>
                <Input 
                  id="port"
                  type="number" 
                  value={connectionInfo.port.toString()} 
                  onChange={(e) => onConnectionInfoChange('port', e.target.value)}
                  placeholder={`默认: ${DATABASE_CONFIG[connectionInfo.dbType as DatabaseType].defaultPort}`}
                  disabled={connecting}
                />
              </div>
            </>
          )}
          
          <div className="space-y-1">
            <Label htmlFor="username">用户名</Label>
            <Input 
              id="username"
              value={connectionInfo.username} 
              onChange={(e) => onConnectionInfoChange('username', e.target.value)}
              placeholder="例如: root" 
              disabled={connecting}
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="password">密码</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={connectionInfo.password}
                onChange={(e) => onConnectionInfoChange('password', e.target.value)}
                disabled={connecting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="dbname">数据库名</Label>
            <Input 
              id="dbname"
              value={connectionInfo.dbName} 
              onChange={(e) => onConnectionInfoChange('dbName', e.target.value)}
              placeholder="例如: mysql" 
              disabled={connecting}
            />
          </div>
          
          {/* <div className="flex items-center space-x-2 pb-1">
            <Checkbox 
              id="rememberConnection" 
              checked={rememberConnection}
              onCheckedChange={(checked) => setRememberConnection(!!checked)}
              disabled={connecting}
            />
            <Label 
              htmlFor="rememberConnection" 
              className="text-lm cursor-pointer truncate"
            >
              记住我的连接信息 (7天)
            </Label>
          </div> */}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button 
              onClick={testConnection} 
              variant="outline" 
              disabled={testingConnection || connecting}
              size="sm"
              className="w-full"
            >
              {testingConnection ? '测试中...' : '测试连接'}
            </Button>
            
            {!connected ? (
              <Button 
                onClick={handleConnect} 
                disabled={connecting}
                size="sm"
                className="w-full"
              >
                {connecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span className="truncate">连接中...</span>
                  </>
                ) : <span className="truncate">连接</span>}
              </Button>
            ) : (
              <Button 
                onClick={onDisconnect} 
                variant="outline" 
                size="sm"
                className="w-full"
              >
                <span className="truncate">断开连接</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 