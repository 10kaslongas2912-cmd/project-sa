export interface DashboardStats {
  dogs_in_shelter: number;
  dogs_adopted: number;
  total_money_donated: number;
  total_items_donated: number;
  vaccinations_given: number;
  dogs_sponsored: number;
}

export interface RecentUpdate {
  dog_name: string;
  note: string;
  tag: string;
  updated_at: string;
}

export interface DashboardStatsResponse {
  message: string;
  data: DashboardStats;
}

export interface DashboardRecentUpdatesResponse {
  message: string;
  data: RecentUpdate[];
}