import { redirect } from "next/navigation";

export default function DealerNewVehiclePage() {
  // Redirect to the main publish form
  // The publish form already handles dealer association
  redirect("/publicar");
}
