import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Building2, User, Bell, Shield, Package } from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('organization');

  const tabs = [
    { id: 'organization', name: 'Organização', icon: Building2 },
    { id: 'profile', name: 'Perfil', icon: User },
    { id: 'modules', name: 'Módulos', icon: Package },
    { id: 'notifications', name: 'Notificações', icon: Bell },
    { id: 'security', name: 'Segurança', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-gray-600 mt-1">Gerencie as configurações da sua organização</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar de Tabs */}
        <div className="w-64 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'organization' && <OrganizationSettings />}
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'modules' && <ModulesSettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'security' && <SecuritySettings />}
        </div>
      </div>
    </div>
  );
}

function OrganizationSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações da Organização</CardTitle>
        <CardDescription>
          Gerencie as informações da sua empresa distribuidora/fornecedora
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Nome da Empresa</Label>
            <Input id="company-name" placeholder="Distribuidora OPME Ltda" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input id="cnpj" placeholder="00.000.000/0001-00" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail Corporativo</Label>
            <Input id="email" type="email" placeholder="contato@empresa.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" placeholder="(11) 3333-4444" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Endereço Completo</Label>
          <Textarea id="address" placeholder="Rua, número, bairro, cidade, estado" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialties">Especialidades</Label>
          <Input id="specialties" placeholder="Ortopedia, Cardiologia, Neurologia..." />
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline">Cancelar</Button>
          <Button>Salvar Alterações</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ProfileSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil do Usuário</CardTitle>
        <CardDescription>Atualize suas informações pessoais</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="full-name">Nome Completo</Label>
            <Input id="full-name" placeholder="Seu nome" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Cargo</Label>
            <Input id="role" placeholder="Gerente de Vendas" disabled />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="user-email">E-mail</Label>
            <Input id="user-email" type="email" placeholder="seu@email.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-phone">Telefone</Label>
            <Input id="user-phone" placeholder="(11) 98765-4321" />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline">Cancelar</Button>
          <Button>Salvar Alterações</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ModulesSettings() {
  const modules = [
    { code: 'quotes', name: 'Cotações', description: 'Gerenciamento de cotações e pedidos', enabled: true },
    { code: 'responses', name: 'Respostas', description: 'Responder cotações de clientes', enabled: true },
    { code: 'products', name: 'Produtos', description: 'Catálogo de produtos OPME', enabled: true },
    { code: 'inventory', name: 'Estoque', description: 'Controle de estoque', enabled: false },
    { code: 'pricing', name: 'Precificação', description: 'Gestão de preços e tabelas', enabled: false },
    { code: 'customers', name: 'Clientes', description: 'Gestão de hospitais e clínicas', enabled: true },
    { code: 'reports', name: 'Relatórios', description: 'Relatórios e análises', enabled: false },
    { code: 'integrations', name: 'Integrações', description: 'Integrações com portais externos', enabled: false },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Módulos do Sistema</CardTitle>
        <CardDescription>
          Ative ou desative módulos conforme as necessidades da sua organização
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {modules.map((module) => (
          <div
            key={module.code}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
          >
            <div className="flex-1">
              <h3 className="font-medium">{module.name}</h3>
              <p className="text-sm text-gray-600">{module.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={module.enabled}
                className="sr-only peer"
                onChange={() => {}}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function NotificationSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferências de Notificações</CardTitle>
        <CardDescription>Configure como você deseja receber notificações</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Novas Cotações</p>
              <p className="text-sm text-gray-600">Receber notificação quando houver nova cotação</p>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Respostas Enviadas</p>
              <p className="text-sm text-gray-600">Confirmar quando sua resposta for enviada</p>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Prazo Próximo</p>
              <p className="text-sm text-gray-600">Alertar quando o prazo estiver próximo</p>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline">Cancelar</Button>
          <Button>Salvar Preferências</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SecuritySettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Segurança</CardTitle>
        <CardDescription>Gerencie a segurança da sua conta</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="current-password">Senha Atual</Label>
          <Input id="current-password" type="password" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-password">Nova Senha</Label>
          <Input id="new-password" type="password" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
          <Input id="confirm-password" type="password" />
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline">Cancelar</Button>
          <Button>Alterar Senha</Button>
        </div>
      </CardContent>
    </Card>
  );
}
