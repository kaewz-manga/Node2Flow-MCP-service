import { Suspense, type ComponentType, type LazyExoticComponent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';

export interface PluginTab {
  id: string;
  label: string;
  component: LazyExoticComponent<ComponentType<any>>;
}

export interface PluginTabsProps {
  tabs: PluginTab[];
  defaultTab?: string;
}

export function PluginTabs({ tabs, defaultTab }: PluginTabsProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || defaultTab || tabs[0]?.id;

  const handleTabChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', value);
    setSearchParams(newParams, { replace: true });
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList variant="line" className="overflow-x-auto mb-6">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id}>
          <Suspense
            fallback={
              <div className="flex justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            }
          >
            <tab.component />
          </Suspense>
        </TabsContent>
      ))}
    </Tabs>
  );
}

export default PluginTabs;
