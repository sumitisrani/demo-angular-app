class AddColumnToTask < ActiveRecord::Migration
  def change
    add_column :tasks, :shared_id, :integer
  end
end
