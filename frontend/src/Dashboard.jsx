import React from 'react';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../contexts/AuthContext';

const data = [
  { name: 'Jan', candidates: 4000, jobs: 2400 },
  { name: 'Fev', candidates: 3000, jobs: 1398 },
  { name: 'Mar', candidates: 2000, jobs: 9800 },
  { name: 'Abr', candidates: 2780, jobs: 3908 },
  { name: 'Mai', candidates: 1890, jobs: 4800 },
  { name: 'Jun', candidates: 2390, jobs: 3800 },
  { name: 'Jul', candidates: 3490, jobs: 4300 },
];

const pieData = [
  { name: 'Novos', value: 400 },
  { name: 'Contatados', value: 300 },
  { name: 'Entrevistados', value: 300 },
  { name: 'Contratados', value: 200 },
  { name: 'Rejeitados', value: 100 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Bem-vindo, {user?.first_name}!</h1>
        <p className="text-muted-foreground">Visão geral do seu pipeline de recrutamento.</p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Candidatos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+2,350</div>
              <p className="text-xs text-muted-foreground">+20.1% do mês passado</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vagas Abertas</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+150</div>
              <p className="text-xs text-muted-foreground">+10.5% do mês passado</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contratados Mês</CardTitle>
              <UserCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+35</div>
              <p className="text-xs text-muted-foreground">+5.2% do mês passado</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Médio de Preenchimento</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">28 dias</div>
              <p className="text-xs text-muted-foreground">-3 dias do mês passado</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Candidatos e Vagas por Mês</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="candidates" fill="#8884d8" name="Candidatos" />
                  <Bar dataKey="jobs" fill="#82ca9d" name="Vagas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Status dos Candidatos</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

