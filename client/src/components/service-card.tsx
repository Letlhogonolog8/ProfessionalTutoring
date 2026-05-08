import { CheckIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ServiceItem {
  icon: React.ReactNode;
  title: string;
  features: string[];
}

interface ServiceCardProps {
  service: ServiceItem;
  className?: string;
}

export function ServiceCard({ service, className }: ServiceCardProps) {
  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 hover:shadow-lg service-card",
      className
    )}>
      <CardContent className="p-6">
        <div className="h-16 w-16 bg-gradient-to-r from-purple-600 to-blue-500 rounded-2xl flex items-center justify-center mb-4 card-icon transition-transform duration-300">
          {service.icon}
        </div>
        <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
        <ul className="space-y-2 text-muted-foreground">
          {service.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <CheckIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
