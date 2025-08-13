import React, { useState } from 'react';
import Layout from '../components/Layout';
import { tagsAPI } from '../lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, PlusCircle, Edit, Trash2 } from 'lucide-react';

const Tags = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['tags'],
    queryFn: tagsAPI.getTags,
  });

  const createTagMutation = useMutation({
    mutationFn: tagsAPI.createTag,
    onSuccess: () => {
      queryClient.invalidateQueries(['tags']);
      toast.success('Tag criada com sucesso!');
      setIsModalOpen(false);
      setFormData({
        name: '',
        description: '',
      });
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Erro ao criar tag.');
    },
  });

  const updateTagMutation = useMutation({
    mutationFn: ({ id, data }) => tagsAPI.updateTag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tags']);
      toast.success('Tag atualizada com sucesso!');
      setIsModalOpen(false);
      setEditingTag(null);
      setFormData({
        name: '',
        description: '',
      });
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Erro ao atualizar tag.');
    },
  });

  const deleteTagMutation = useMutation({
    mutationFn: tagsAPI.deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries(['tags']);
      toast.success('Tag excluída com sucesso!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Erro ao excluir tag.');
    },
  });

  const handleFormChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTag) {
      updateTagMutation.mutate({ id: editingTag.id, data: formData });
    } else {
      createTagMutation.mutate(formData);
    }
  };

  const handleEdit = (tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name || '',
      description: tag.description || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta tag?')) {
      deleteTagMutation.mutate(id);
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
        <div className="text-red-500">Erro ao carregar tags: {error.message}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Gerenciamento de Tags</h1>

        <div className="flex justify-end">
          <Button onClick={() => {
            setEditingTag(null);
            setFormData({
              name: '',
              description: '',
            });
            setIsModalOpen(true);
          }}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Tag
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.tags?.length > 0 ? (
                data.tags.map((tag) => (
                  <TableRow key={tag.id}>
                    <TableCell className="font-medium">{tag.name}</TableCell>
                    <TableCell>{tag.description}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(tag)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(tag.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">Nenhuma tag encontrada.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingTag ? 'Editar Tag' : 'Adicionar Nova Tag'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Nome</Label>
                <Input id="name" value={formData.name} onChange={handleFormChange} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Descrição</Label>
                <Input id="description" value={formData.description} onChange={handleFormChange} className="col-span-3" />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createTagMutation.isLoading || updateTagMutation.isLoading}>
                  {createTagMutation.isLoading || updateTagMutation.isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {editingTag ? 'Salvar Alterações' : 'Adicionar Tag'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Tags;

