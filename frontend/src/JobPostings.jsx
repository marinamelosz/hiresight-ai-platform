import React, { useState } from 'react';
import Layout from '../components/Layout';
import { jobPostingsAPI } from '../lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, PlusCircle, Search, Edit, Trash2 } from 'lucide-react';

const JobPostings = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJobPosting, setEditingJobPosting] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    department: '',
    location: '',
    employment_type: 'full-time',
    experience_level: 'entry',
    salary_min: '',
    salary_max: '',
    currency: 'BRL',
    remote_work: false,
    status: 'draft',
    priority: 'medium',
    external_job_id: '',
    deadline: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['jobPostings', { searchQuery, statusFilter }],
    queryFn: () => jobPostingsAPI.getJobPostings({
      search: searchQuery,
      status: statusFilter,
    }),
  });

  const createJobPostingMutation = useMutation({
    mutationFn: jobPostingsAPI.createJobPosting,
    onSuccess: () => {
      queryClient.invalidateQueries(['jobPostings']);
      toast.success('Vaga criada com sucesso!');
      setIsModalOpen(false);
      setFormData({
        title: '',
        description: '',
        requirements: '',
        responsibilities: '',
        department: '',
        location: '',
        employment_type: 'full-time',
        experience_level: 'entry',
        salary_min: '',
        salary_max: '',
        currency: 'BRL',
        remote_work: false,
        status: 'draft',
        priority: 'medium',
        external_job_id: '',
        deadline: '',
      });
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Erro ao criar vaga.');
    },
  });

  const updateJobPostingMutation = useMutation({
    mutationFn: ({ id, data }) => jobPostingsAPI.updateJobPosting(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['jobPostings']);
      toast.success('Vaga atualizada com sucesso!');
      setIsModalOpen(false);
      setEditingJobPosting(null);
      setFormData({
        title: '',
        description: '',
        requirements: '',
        responsibilities: '',
        department: '',
        location: '',
        employment_type: 'full-time',
        experience_level: 'entry',
        salary_min: '',
        salary_max: '',
        currency: 'BRL',
        remote_work: false,
        status: 'draft',
        priority: 'medium',
        external_job_id: '',
        deadline: '',
      });
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Erro ao atualizar vaga.');
    },
  });

  const deleteJobPostingMutation = useMutation({
    mutationFn: jobPostingsAPI.deleteJobPosting,
    onSuccess: () => {
      queryClient.invalidateQueries(['jobPostings']);
      toast.success('Vaga excluída com sucesso!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Erro ao excluir vaga.');
    },
  });

  const handleFormChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
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
    if (editingJobPosting) {
      updateJobPostingMutation.mutate({ id: editingJobPosting.id, data: formData });
    } else {
      createJobPostingMutation.mutate(formData);
    }
  };

  const handleEdit = (jobPosting) => {
    setEditingJobPosting(jobPosting);
    setFormData({
      title: jobPosting.title || '',
      description: jobPosting.description || '',
      requirements: jobPosting.requirements || '',
      responsibilities: jobPosting.responsibilities || '',
      department: jobPosting.department || '',
      location: jobPosting.location || '',
      employment_type: jobPosting.employment_type || 'full-time',
      experience_level: jobPosting.experience_level || 'entry',
      salary_min: jobPosting.salary_min || '',
      salary_max: jobPosting.salary_max || '',
      currency: jobPosting.currency || 'BRL',
      remote_work: jobPosting.remote_work || false,
      status: jobPosting.status || 'draft',
      priority: jobPosting.priority || 'medium',
      external_job_id: jobPosting.external_job_id || '',
      deadline: jobPosting.deadline ? new Date(jobPosting.deadline).toISOString().split('T')[0] : '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta vaga?')) {
      deleteJobPostingMutation.mutate(id);
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
        <div className="text-red-500">Erro ao carregar vagas: {error.message}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Gerenciamento de Vagas</h1>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar vagas..." 
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os Status</SelectItem>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="active">Ativa</SelectItem>
              <SelectItem value="paused">Pausada</SelectItem>
              <SelectItem value="closed">Fechada</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => {
            setEditingJobPosting(null);
            setFormData({
              title: '',
              description: '',
              requirements: '',
              responsibilities: '',
              department: '',
              location: '',
              employment_type: 'full-time',
              experience_level: 'entry',
              salary_min: '',
              salary_max: '',
              currency: 'BRL',
              remote_work: false,
              status: 'draft',
              priority: 'medium',
              external_job_id: '',
              deadline: '',
            });
            setIsModalOpen(true);
          }}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Vaga
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tipo de Emprego</TableHead>
                <TableHead>Nível de Experiência</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.job_postings?.length > 0 ? (
                data.job_postings.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell>{job.location}</TableCell>
                    <TableCell>{job.status}</TableCell>
                    <TableCell>{job.employment_type}</TableCell>
                    <TableCell>{job.experience_level}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(job)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(job.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Nenhuma vaga encontrada.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingJobPosting ? 'Editar Vaga' : 'Adicionar Nova Vaga'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Título</Label>
                <Input id="title" value={formData.title} onChange={handleFormChange} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Descrição</Label>
                <Textarea id="description" value={formData.description} onChange={handleFormChange} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="requirements" className="text-right">Requisitos</Label>
                <Textarea id="requirements" value={formData.requirements} onChange={handleFormChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="responsibilities" className="text-right">Responsabilidades</Label>
                <Textarea id="responsibilities" value={formData.responsibilities} onChange={handleFormChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="department" className="text-right">Departamento</Label>
                <Input id="department" value={formData.department} onChange={handleFormChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">Localização</Label>
                <Input id="location" value={formData.location} onChange={handleFormChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="employment_type" className="text-right">Tipo de Emprego</Label>
                <Select id="employment_type" value={formData.employment_type} onValueChange={(value) => handleSelectChange('employment_type', value)} className="col-span-3">
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione o Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Tempo Integral</SelectItem>
                    <SelectItem value="part-time">Meio Período</SelectItem>
                    <SelectItem value="contract">Contrato</SelectItem>
                    <SelectItem value="temporary">Temporário</SelectItem>
                    <SelectItem value="internship">Estágio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="experience_level" className="text-right">Nível de Experiência</Label>
                <Select id="experience_level" value={formData.experience_level} onValueChange={(value) => handleSelectChange('experience_level', value)} className="col-span-3">
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione o Nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entrada</SelectItem>
                    <SelectItem value="mid">Intermediário</SelectItem>
                    <SelectItem value="senior">Sênior</SelectItem>
                    <SelectItem value="executive">Executivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="salary_min" className="text-right">Salário Mínimo</Label>
                <Input id="salary_min" type="number" value={formData.salary_min} onChange={handleFormChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="salary_max" className="text-right">Salário Máximo</Label>
                <Input id="salary_max" type="number" value={formData.salary_max} onChange={handleFormChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="currency" className="text-right">Moeda</Label>
                <Input id="currency" value={formData.currency} onChange={handleFormChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="remote_work" className="text-right">Trabalho Remoto</Label>
                <input id="remote_work" type="checkbox" checked={formData.remote_work} onChange={handleFormChange} className="col-span-3 w-4 h-4" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Status</Label>
                <Select id="status" value={formData.status} onValueChange={(value) => handleSelectChange('status', value)} className="col-span-3">
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione o Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="active">Ativa</SelectItem>
                    <SelectItem value="paused">Pausada</SelectItem>
                    <SelectItem value="closed">Fechada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="priority" className="text-right">Prioridade</Label>
                <Select id="priority" value={formData.priority} onValueChange={(value) => handleSelectChange('priority', value)} className="col-span-3">
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione a Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="external_job_id" className="text-right">ID Externo</Label>
                <Input id="external_job_id" value={formData.external_job_id} onChange={handleFormChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="deadline" className="text-right">Prazo</Label>
                <Input id="deadline" type="date" value={formData.deadline} onChange={handleFormChange} className="col-span-3" />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createJobPostingMutation.isLoading || updateJobPostingMutation.isLoading}>
                  {createJobPostingMutation.isLoading || updateJobPostingMutation.isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {editingJobPosting ? 'Salvar Alterações' : 'Adicionar Vaga'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default JobPostings;

