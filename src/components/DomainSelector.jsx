import React from 'react';
import { motion } from 'framer-motion';
import { Scale, Briefcase, Code, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const domains = [
  {
    id: 'legal',
    name: 'Legal',
    icon: Scale,
    description: 'Contract analysis, legal research, compliance guidance',
    gradient: 'from-red-500 to-pink-600',
    bgGradient: 'from-red-500/10 to-pink-600/10'
  },
  {
    id: 'business',
    name: 'Business',
    icon: Briefcase,
    description: 'Strategy planning, market analysis, financial modeling',
    gradient: 'from-blue-500 to-cyan-600',
    bgGradient: 'from-blue-500/10 to-cyan-600/10'
  },
  {
    id: 'coding',
    name: 'Coding',
    icon: Code,
    description: 'Code review, debugging, architecture design',
    gradient: 'from-green-500 to-emerald-600',
    bgGradient: 'from-green-500/10 to-emerald-600/10'
  }
];

const DomainSelector = ({ selectedDomain, onDomainChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {domains.map((domain) => {
        const Icon = domain.icon;
        const isSelected = selectedDomain === domain.id;
        
        return (
          <motion.div
            key={domain.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className={`cursor-pointer transition-all duration-300 ${
                isSelected 
                  ? `ring-2 ring-primary glow bg-gradient-to-br ${domain.bgGradient}` 
                  : 'hover:shadow-lg glass-effect'
              }`}
              onClick={() => onDomainChange(domain.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${domain.gradient} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{domain.name}</h3>
                    {isSelected && (
                      <div className="flex items-center gap-1 text-xs text-primary">
                        <Sparkles className="w-3 h-3" />
                        Active
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{domain.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default DomainSelector;