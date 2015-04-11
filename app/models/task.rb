class Task < ActiveRecord::Base
  has_one :user
  has_many :shared_tasks
  has_many :shared_users, through: :shared_tasks, foreign_key: :user_id, source: :user
end
