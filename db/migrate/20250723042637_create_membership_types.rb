class CreateMembershipTypes < ActiveRecord::Migration[7.2]
  def change
    create_table :membership_types do |t|
      t.string :name
      t.text :features
      t.integer :duration_days
      t.decimal :price

      t.timestamps
    end
  end
end
