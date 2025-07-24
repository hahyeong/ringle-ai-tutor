class AddUsageCountToMemberships < ActiveRecord::Migration[7.2]
  def change
    add_column :memberships, :usage_count, :integer
    add_column :memberships, :usage_limit, :integer
  end
end
