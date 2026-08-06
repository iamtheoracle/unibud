import React from "react";
import EntityModule from "@/components/management/EntityModule";
import { Receipt } from "lucide-react";

export default function Fees({ institutionId }) {
  return (
    <EntityModule
      entityName="FeeStructure"
      title="Fee Management"
      description="Fee categories, academic session pricing, department pricing, installment plans, discounts, waivers and late fees."
      icon={Receipt}
      institutionId={institutionId}
    />
  );
}