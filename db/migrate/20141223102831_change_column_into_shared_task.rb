class ChangeColumnIntoSharedTask < ActiveRecord::Migration
  def change
    rename_column :shared_tasks, :usre_id, :user_id
  end
end
