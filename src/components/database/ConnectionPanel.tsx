"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import { Server, Database } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConnectionInfo, TableInfo } from "./DatabaseQueryTool";

interface ConnectionPanelProps {
  connectionInfo: ConnectionInfo;
  setConnectionInfo: (info: ConnectionInfo) => void;
  setConnected: (connected: boolean) => void;
  setTables: (tables: TableInfo[]) => void;
}

export function ConnectionPanel({ 
  connectionInfo, 
  setConnectionInfo, 
  setConnected, 
  setTables 
}: ConnectionPanelProps) {
  const [testingConnection, setTestingConnection] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // 处理连接信息变更
  const handleConnectionChange = (field: string, value: any) => {
    setConnectionInfo({
      ...connectionInfo,
      [field]: field === "port" ? parseInt(value) : value
    });
  };

  // 测试数据库连接
  const testConnection = async () => {
    setTestingConnection(true);
    try {
      const response = await axios.post('http://localhost:8080/api/database/test-connection', connectionInfo);
      const result = response.data;
      if (result.success) {
        toast.success('连接成功');
      } else {
        toast.error(result.message || '连接失败');
      }
    } catch (error: any) {
      console.error('测试连接失败', error);
      toast.error('连接失败: ' + (error.response?.data?.message || error.message));
    } finally {
      setTestingConnection(false);
    }
  };

  // 连接数据库并获取表信息
  const connect = async () => {
    setConnecting(true);
    try {
      const response = await axios.post('http://localhost:8080/api/database/tables', connectionInfo);
      setTables(response.data);
      setConnected(true);
      toast.success('已连接到数据库，获取到 ' + response.data.length + ' 个表');
    } catch (error: any) {
      console.error('连接数据库失败', error);
      toast.error('连接失败: ' + (error.response?.data?.message || error.message));
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            数据库连接
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1 text-muted-foreground">数据库类型</label>
              <Select 
                value={connectionInfo.dbType} 
                onValueChange={(value) => handleConnectionChange('dbType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择数据库类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MYSQL">MySQL</SelectItem>
                  <SelectItem value="ORACLE">Oracle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm mb-1 text-muted-foreground">IP地址</label>
              <div className="flex items-center space-x-2">
                <Server className="h-4 w-4 text-muted-foreground" />
                <Input 
                  value={connectionInfo.ip} 
                  onChange={(e) => handleConnectionChange('ip', e.target.value)}
                  placeholder="例如: localhost" 
                  className="flex-1"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm mb-1 text-muted-foreground">端口</label>
              <Input 
                type="number" 
                value={connectionInfo.port} 
                onChange={(e) => handleConnectionChange('port', e.target.value)}
                placeholder="例如: 3306" 
              />
            </div>
            
            <div>
              <label className="block text-sm mb-1 text-muted-foreground">用户名</label>
              <Input 
                value={connectionInfo.username} 
                onChange={(e) => handleConnectionChange('username', e.target.value)}
                placeholder="例如: root" 
              />
            </div>
            
            <div>
              <label className="block text-sm mb-1 text-muted-foreground">密码</label>
              <Input 
                type="password" 
                value={connectionInfo.password} 
                onChange={(e) => handleConnectionChange('password', e.target.value)}
                placeholder="输入密码" 
              />
            </div>
            
            <div>
              <label className="block text-sm mb-1 text-muted-foreground">数据库名</label>
              <Input 
                value={connectionInfo.dbName} 
                onChange={(e) => handleConnectionChange('dbName', e.target.value)}
                placeholder="例如: mysql" 
              />
            </div>
            
            <div className="flex space-x-2 pt-2">
              <Button 
                variant="outline" 
                onClick={testConnection}
                disabled={testingConnection}
                className="flex-1"
              >
                {testingConnection ? '测试中...' : '测试连接'}
              </Button>
              <Button 
                onClick={connect}
                disabled={connecting}
                className="flex-1"
              >
                {connecting ? '连接中...' : '连接'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 