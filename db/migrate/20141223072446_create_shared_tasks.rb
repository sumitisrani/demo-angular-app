class CreateSharedTasks < ActiveRecord::Migration
  def change
    create_table :shared_tasks do |t|
      t.integer :task_id
      t.integer :usre_id

      t.timestamps
    end
  end
end
