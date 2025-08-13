import React, { useState } from 'react';
import Layout from '../components/Layout';
import { atsCrmIntegrationAPI } from '../lib/api';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const Integrations = () => {
  const [candidateData, setCandidateData] = useState('');
  const [atsCrmConfig, setAtsCrmConfig] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');

  const integrateCandidateMutation = useMutation({
    mutationFn: (data) => atsCrmIntegrationAPI.integrateCandidate(data),
    onSuccess: (response) => {
      toast.success(response.message || 'Candidato integrado com sucesso!');
      setCandidateData('');
      setAtsCrmConfig('');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Erro ao integrar candidato.');
    },
  });

  const configureWebhookMutation = useMutation({
    mutationFn: (data) => atsCrmIntegrationAPI.configureWebhook(data),
    onSuccess: (response) => {
      toast.success(response.message || 'Webhook configurado com sucesso!');
      setWebhookUrl('');
      setAtsCrmConfig('');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Erro ao configurar webhook.');
    },
  });

  const handleIntegrateCandidate = (e) => {
    e.preventDefault();
    try {
      const parsedCandidateData = JSON.parse(candidateData);
      const parsedAtsCrmConfig = JSON.parse(atsCrmConfig);
      integrateCandidateMutation.mutate({
        raw_data: parsedCandidateData,
        ats_crm_config: parsedAtsCrmConfig,
      });
    } catch (error) {
      toast.error('Erro ao parsear JSON. Verifique a sintaxe.');
    }
  };

  const handleConfigureWebhook = (e) => {
    e.preventDefault();
    try {
      const parsedAtsCrmConfig = JSON.parse(atsCrmConfig);
      configureWebhookMutation.mutate({
        ats_crm_config: parsedAtsCrmConfig,
        webhook_url: webhookUrl,
      });
    } catch (error) {
      toast.error('Erro ao parsear JSON. Verifique a sintaxe.');
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Integrações ATS/CRM</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Seção de Integração de Candidatos */}
          <div className="border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Integrar Candidato</h2>
            <form onSubmit={handleIntegrateCandidate} className="flex flex-col gap-4">
              <div>
                <Label htmlFor="candidateData" className="mb-2 block">Dados Brutos do Candidato (JSON)</Label>
                <textarea
                  id="candidateData"
                  value={candidateData}
                  onChange={(e) => setCandidateData(e.target.value)}
                  className="w-full p-2 border rounded-md min-h-[150px]"
                  placeholder="Ex: { \"firstName\": \"João\", \"email\": \"joao@example.com\" }"
                  required
                ></textarea>
              </div>
              <div>
                <Label htmlFor="atsCrmConfig" className="mb-2 block">Configuração ATS/CRM (JSON)</Label>
                <textarea
                  id="atsCrmConfig"
                  value={atsCrmConfig}
                  onChange={(e) => setAtsCrmConfig(e.target.value)}
                  className="w-full p-2 border rounded-md min-h-[100px]"
                  placeholder="Ex: { \"type\": \"Greenhouse\", \"apiKey\": \"your_api_key\" }"
                  required
                ></textarea>
              </div>
              <Button type="submit" disabled={integrateCandidateMutation.isLoading}>
                {integrateCandidateMutation.isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Integrar Candidato
              </Button>
            </form>
          </div>

          {/* Seção de Configuração de Webhook */}
          <div className="border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Configurar Webhook</h2>
            <form onSubmit={handleConfigureWebhook} className="flex flex-col gap-4">
              <div>
                <Label htmlFor="webhookUrl" className="mb-2 block">URL do Webhook</Label>
                <Input
                  id="webhookUrl"
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="Ex: https://your-platform.com/api/ats-webhook"
                  required
                />
              </div>
              <div>
                <Label htmlFor="atsCrmConfigWebhook" className="mb-2 block">Configuração ATS/CRM (JSON)</Label>
                <textarea
                  id="atsCrmConfigWebhook"
                  value={atsCrmConfig}
                  onChange={(e) => setAtsCrmConfig(e.target.value)}
                  className="w-full p-2 border rounded-md min-h-[100px]"
                  placeholder="Ex: { \"type\": \"Greenhouse\", \"apiKey\": \"your_api_key\" }"
                  required
                ></textarea>
              </div>
              <Button type="submit" disabled={configureWebhookMutation.isLoading}>
                {configureWebhookMutation.isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Configurar Webhook
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Integrations;

