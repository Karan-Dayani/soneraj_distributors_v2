"use client";
import Error from "@/app/components/Error";
import Loader from "@/app/components/Loader";
import { useOrderItems } from "@/app/utils/hooks/useOrders";
import { useParams } from "next/navigation";

export default function OrderDetails() {
  const params = useParams();
  const { id } = params;
  const { data, error, isLoading } = useOrderItems({ id: Number(id) });

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <Error error={error.message} />;
  }

  return (
    <>
      <div>{JSON.stringify(data, null, 2)}</div>
    </>
  );
}
