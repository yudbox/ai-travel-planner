import Image from "next/image";
import { MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PlaceCardProps {
  name: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  location: string;
}

export function PlaceCard({
  name,
  description,
  imageSrc,
  imageAlt,
  location,
}: PlaceCardProps) {
  return (
    <Card className="overflow-hidden py-0 gap-0">
      <div className="relative aspect-[4/3] w-full">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <CardHeader className="pt-5">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{name}</CardTitle>
          <Badge variant="secondary" className="shrink-0">
            <MapPin className="size-3" />
            {location}
          </Badge>
        </div>
        <CardDescription className="leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-6" />
    </Card>
  );
}
