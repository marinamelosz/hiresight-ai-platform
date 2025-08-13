import React, { useState } from 'react';
import Layout from '../components/Layout';
import { candidatesAPI } from '../lib/api';
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

const Candidates = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    linkedin_url: '',
    resume_text: '',
    skills: '',
    experience_years: '',
    current_position: '',
    current_company: '',
    location: '',
    salary_expectation: '',
    availability: '',
    source: 'manual',
    status: 'new',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['candidates', { searchQuery, statusFilter }],
    queryFn: () => candidatesAPI.getCandidates({
      search: searchQuery,
      status: statusFilter,
    }),
  });

  const createCandidateMutation = useMutation({
    mutationFn: candidatesAPI.createCandidate,
    onSuccess: () => {
      queryClient.invalidateQueries(['candidates']);
      toast.success('Candidato criado com sucesso!');
      setIsModalOpen(false);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        linkedin_url: '',
        resume_text: '',
        skills: '',
        experience_years: '',
        current_position: '',
        current_company: '',
        location: '',
        salary_expectation: '',
        availability: '',
        source: 'manual',
        status: 'new',
      });
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Erro ao criar candidato.');
    },
  });

  const updateCandidateMutation = useMutation({
    mutationFn: ({ id, data }) => candidatesAPI.updateCandidate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['candidates']);
      toast.success('Candidato atualizado com sucesso!');
      setIsModalOpen(false);
      setEditingCandidate(null);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        linkedin_url: '',
        resume_text: '',
        skills: '',
        experience_years: '',
        current_position: '',
        current_company: '',
        location: '',
        salary_expectation: '',
        availability: '',
        source: 'manual',
        status: 'new',
      });
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Erro ao atualizar candidato.');
    },
  });

  const deleteCandidateMutation = useMutation({
    mutationFn: candidatesAPI.deleteCandidate,
    onSuccess: () => {
      queryClient.invalidateQueries(['candidates']);
      toast.success('Candidato excluído com sucesso!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Erro ao excluir candidato.');
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
    if (editingCandidate) {
      updateCandidateMutation.mutate({ id: editingCandidate.id, data: formData });
    } else {
      createCandidateMutation.mutate(formData);
    }
  };

  const handleEdit = (candidate) => {
    setEditingCandidate(candidate);
    setFormData({
      first_name: candidate.first_name || '',
      last_name: candidate.last_name || '',
      email: candidate.email || '',
      phone: candidate.phone || '',
      linkedin_url: candidate.linkedin_url || '',
      resume_text: candidate.resume_text || '',
      skills: candidate.skills || '',
      experience_years: candidate.experience_years || '',
      current_position: candidate.current_position || '',
      current_company: candidate.current_company || '',
      location: candidate.location || '',
      salary_expectation: candidate.salary_expectation || '',
      availability: candidate.availability || '',
      source: candidate.source || 'manual',
      status: candidate.status || 'new',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este candidato?')) {
      deleteCandidateMutation.mutate(id);
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
        <div className="text-red-500">Erro ao carregar candidatos: {error.message}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Gerenciamento de Candidatos</h1>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar candidatos..." 
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
              <SelectItem value="new">Novo</SelectItem>
              <SelectItem value="contacted">Contatado</SelectItem>
              <SelectItem value="interviewed">Entrevistado</SelectItem>
              <SelectItem value="hired">Contratado</SelectItem>
              <SelectItem value="rejected">Rejeitado</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => {
            setEditingCandidate(null);
            setFormData({
              first_name: '',
              last_name: '',
              email: '',
              phone: '',
              linkedin_url: '',
              resume_text: '',
              skills: '',
              experience_years: '',
              current_position: '',
              current_company: '',
              location: '',
              salary_expectation: '',
              availability: '',
              source: 'manual',
              status: 'new',
            });
            setIsModalOpen(true);
          }}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Candidato
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Posição Atual</TableHead>
                <TableHead>Empresa Atual</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.candidates?.length > 0 ? (
                data.candidates.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell className="font-medium">{candidate.first_name} {candidate.last_name}</TableCell>
                    <TableCell>{candidate.email}</TableCell>
                    <TableCell>{candidate.status}</TableCell>
                    <TableCell>{candidate.current_position}</TableCell>
                    <TableCell>{candidate.current_company}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(candidate)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(candidate.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Nenhum candidato encontrado.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingCandidate ? 'Editar Candidato' : 'Adicionar Novo Candidato'}</DialogTitle>
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
                <Input id="email" type="email" value={formData.email} onChange={handleFormChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">Telefone</Label>
                <Input id="phone" value={formData.phone} onChange={handleFormChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="linkedin_url" className="text-right">LinkedIn URL</Label>
                <Input id="linkedin_url" value={formData.linkedin_url} onChange={handleFormChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="current_position" className="text-right">Posição Atual</Label>
                <Input id="current_position" value={formData.current_position} onChange={handleFormChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="current_company" className="text-right">Empresa Atual</Label>
                <Input id="current_company" value={formData.current_company} onChange={handleFormChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">Localização</Label>
                <Input id="location" value={formData.location} onChange={handleFormChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="experience_years" className="text-right">Anos de Exp.</Label>
                <Input id="experience_years" type="number" value={formData.experience_years} onChange={handleFormChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="salary_expectation" className="text-right">Expectativa Salarial</Label>
                <Input id="salary_expectation" type="number" value={formData.salary_expectation} onChange={handleFormChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="availability" className="text-right">Disponibilidade</Label>
                <Input id="availability" value={formData.availability} onChange={handleFormChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Status</Label>
                <Select id="status" value={formData.status} onValueChange={(value) => handleSelectChange('status', value)} className="col-span-3">
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione o Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Novo</SelectItem>
                    <SelectItem value="contacted">Contatado</SelectItem>
                    <SelectItem value="interviewed">Entrevistado</SelectItem>
                    <SelectItem value="hired">Contratado</SelectItem>
                    <SelectItem value="rejected">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="skills" className="text-right">Habilidades</Label>
                <Textarea id="skills" value={formData.skills} onChange={handleFormChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="resume_text" className="text-right">Texto do Currículo</Label>
                <Textarea id="resume_text" value={formData.resume_text} onChange={handleFormChange} className="col-span-3" />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createCandidateMutation.isLoading || updateCandidateMutation.isLoading}>
                  {createCandidateMutation.isLoading || updateCandidateMutation.isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {editingCandidate ? 'Salvar Alterações' : 'Adicionar Candidato'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Candidates;

