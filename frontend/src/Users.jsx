import React, { useState } from 'react';
import Layout from '../components/Layout';
import { usersAPI } from '../lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, PlusCircle, Search, Edit, Trash2 } from 'lucide-react';

const Users = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'recruiter',
    status: 'active',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['users', { searchQuery, roleFilter, statusFilter }],
    queryFn: () => usersAPI.getUsers({
      search: searchQuery,
      role: roleFilter,
      status: statusFilter,
    }),
  });

  const createUserMutation = useMutation({
    mutationFn: usersAPI.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('Usuário criado com sucesso!');
      setIsModalOpen(false);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        role: 'recruiter',
        status: 'active',
      });
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Erro ao criar usuário.');
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }) => usersAPI.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('Usuário atualizado com sucesso!');
      setIsModalOpen(false);
      setEditingUser(null);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        role: 'recruiter',
        status: 'active',
      });
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Erro ao atualizar usuário.');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: usersAPI.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('Usuário excluído com sucesso!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Erro ao excluir usuário.');
    },
  });

  const handleFormChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSelectChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, data: formData });
    } else {
      createUserMutation.mutate(formData);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      password: '', // Senha não é preenchida para edição
      role: user.role || 'recruiter',
      status: user.status || 'active',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      deleteUserMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-red-500">Erro ao carregar usuários: {error.message}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuários..." 
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por Função" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as Funções</SelectItem>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="manager">Gerente</SelectItem>
              <SelectItem value="recruiter">Recrutador</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os Status</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="inactive">Inativo</SelectItem>
              <SelectItem value="suspended">Suspenso</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => {
            setEditingUser(null);
            setFormData({
              first_name: '',
              last_name: '',
              email: '',
              password: '',
              role: 'recruiter',
              status: 'active',
            });
            setIsModalOpen(true);
          }}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Usuário
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.users?.length > 0 ? (
                data.users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.first_name} {user.last_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="capitalize">{user.role}</TableCell>
                    <TableCell className="capitalize">{user.status}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(user)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(user.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Nenhum usuário encontrado.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Editar Usuário' : 'Adicionar Novo Usuário'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="first_name" className="text-right">Nome</Label>
                <Input id="first_name" value={formData.first_name} onChange={handleFormChange} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="last_name" className="text-right">Sobrenome</Label>
                <Input id="last_name" value={formData.last_name} onChange={handleFormChange} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={handleFormChange} className="col-span-3" required />
              </div>
              {!editingUser && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">Senha</Label>
                  <Input id="password" type="password" value={formData.password} onChange={handleFormChange} className="col-span-3" required />
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">Função</Label>
                <Select id="role" value={formData.role} onValueChange={(value) => handleSelectChange('role', value)} className="col-span-3">
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione a Função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="manager">Gerente</SelectItem>
                    <SelectItem value="recruiter">Recrutador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Status</Label>
                <Select id="status" value={formData.status} onValueChange={(value) => handleSelectChange('status', value)} className="col-span-3">
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione o Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="suspended">Suspenso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createUserMutation.isLoading || updateUserMutation.isLoading}>
                  {createUserMutation.isLoading || updateUserMutation.isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {editingUser ? 'Salvar Alterações' : 'Adicionar Usuário'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Users;

