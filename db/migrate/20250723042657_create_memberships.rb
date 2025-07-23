class CreateMemberships < ActiveRecord::Migration[7.2]
  def change
    create_table :memberships do |t|
      t.references :user, null: false, foreign_key: true
      t.references :membership_type, null: false, foreign_key: true
      t.datetime :expires_at

      t.timestamps
    end
  end
end
