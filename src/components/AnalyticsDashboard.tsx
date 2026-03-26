'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsDashboardProps {
  responses: any[];
}

export function AnalyticsDashboard({ responses }: AnalyticsDashboardProps) {
  const [sentimentData, setSentimentData] = useState<any[]>([]);
  const [themeData, setThemeData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    avgSentiment: 0,
    positive: 0,
    neutral: 0,
    negative: 0,
  });

  useEffect(() => {
    if (!responses.length) return;

    let positive = 0,
      neutral = 0,
      negative = 0;
    let totalSentiment = 0;

    responses.forEach((response) => {
      const sentiment = response.sentiment_score || 0;
      totalSentiment += sentiment;

      if (sentiment > 0.3) positive++;
      else if (sentiment < -0.3) negative++;
      else neutral++;
    });

    const avgSentiment = totalSentiment / responses.length;

    setSentimentData([
      { name: 'Positive', value: positive, fill: '#10b981' },
      { name: 'Neutral', value: neutral, fill: '#6b7280' },
      { name: 'Negative', value: negative, fill: '#ef4444' },
    ]);

    setStats({
      total: responses.length,
      avgSentiment,
      positive,
      neutral,
      negative,
    });

    const themes: Record<string, number> = {};
    responses.forEach((response) => {
      if (response.ai_summary) {
        const words = response.ai_summary.split(' ');
        words.forEach((word: string) => {
          if (word.length > 5) {
            themes[word] = (themes[word] || 0) + 1;
          }
        });
      }
    });

    const topThemes = Object.entries(themes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));

    setThemeData(topThemes);
  }, [responses]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Total Responses</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Avg Sentiment</p>
          <p className="text-3xl font-bold text-gray-900">
            {stats.avgSentiment.toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Positive</p>
          <p className="text-3xl font-bold text-green-600">{stats.positive}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Negative</p>
          <p className="text-3xl font-bold text-red-600">{stats.negative}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Sentiment Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Top Themes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={themeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Recent Responses</h3>
        <div className="space-y-4">
          {responses.slice(0, 5).map((response) => (
            <div
              key={response.id}
              className="border-l-4 border-blue-500 pl-4 py-2"
            >
              <p className="font-medium text-gray-900">
                {response.respondent_name || 'Anonymous'}
              </p>
              <p className="text-sm text-gray-600">
                {response.ai_summary || 'No summary available'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(response.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
