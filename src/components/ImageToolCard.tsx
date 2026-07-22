import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ToolDefinition } from '../tools/registry.types';

interface ImageToolCardProps {
  tool: ToolDefinition;
  index?: number;
}

export function ImageToolCard({ tool, index = 0 }: ImageToolCardProps) {
  const Icon = tool.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group h-full"
    >
      <Link
        to={`/tools/${tool.slug}`}
        className="flex h-full flex-col p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
      >
        <div className="flex items-start justify-between mb-5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
            <Icon className="w-6 h-6" />
          </div>
        </div>
        <h3 className="text-base font-black tracking-tight text-neutral-900 dark:text-white mb-1.5">
          {tool.name}
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed line-clamp-2 mb-4 flex-1">
          {tool.description}
        </p>
        <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 group-hover:gap-2.5 transition-all">
          Use Tool <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </Link>
    </motion.div>
  );
}

interface ImageToolGridProps {
  tools: ToolDefinition[];
}

export function ImageToolGrid({ tools }: ImageToolGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
      {tools.map((tool, i) => (
        <ImageToolCard key={tool.id} tool={tool} index={i} />
      ))}
    </div>
  );
}
