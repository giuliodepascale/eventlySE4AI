"use client";

import { SafeOrganization } from "@/app/types";
import OrganizationCard  from '@/components/organization/organization-card';



interface OrganizationListProps {
  organizations: SafeOrganization[];
 
}

const OrganizationList: React.FC<OrganizationListProps> = ({ organizations }) => {
  return (
    <>
        
      {organizations.map((organization: SafeOrganization) => (
        <OrganizationCard key={organization.id} id={organization.id} name={organization.name} imageSrc={organization.imageSrc || "/images/NERO500.jpg"} />
      ))}
      
    </>
  );
};

export default OrganizationList;
