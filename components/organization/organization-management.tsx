// components/OrgnizationManagement.tsx

"use client";

import React from "react";

import { SafeOrganization } from "@/app/types";
import Link from "next/link";

interface OrgnizationManagementProps {
  organization: SafeOrganization;
}

const OrgnizationManagement: React.FC<OrgnizationManagementProps> = ({  organization}) => {
    console.log(organization) 
  return (
    <Link href={`/crea-evento/${organization.id}`}>
    Crea Evento
    </Link>
  
  );
};

export default OrgnizationManagement;
