class Addstatuscolumntotask < ActiveRecord::Migration
  def change
    add_column :tasks, :status, :string, default: 'New'
  end
end
