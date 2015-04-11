class TasksController < ApplicationController
  respond_to :json
  before_filter :authenticate_user!
  
  def index
    tasks = current_user.tasks.all
    present_user = []
    present_user << current_user
    all_users = User.all
    users = all_users - present_user
    shared_tasks = get_shared_tasks
    respond_to do |format|
      format.html
      format.json { render :json => [tasks: tasks.as_json(:include => { :shared_users => {:only => [:id, :name] }}), users: users, shared_tasks: shared_tasks]}
    end
  end
  
  def create
    task = Task.new(task_params)
    if task.save
      render json:{task: task.as_json, status: :ok, message: "Task created succesfully"}
    else
      render json: {task: task.errors, status: :no_content}
    end    
  end
  
  def edit
    task = Task.find(params[:id])
    respond_with(task) do |format|
      format.json { render :json => task.as_json }
      format.html
    end
  end
  
  def update
    task = Task.find(params[:id])
    if task.update_attributes(task_params)
      render :json => { task: task.as_json, status: :ok, message: "Task succesfully updated" }
    else
      render json: {task: task.errors, status: :no_content}
    end  
  end
  
  def destroy
    task = Task.find(params[:id])
    if task.destroy
      render json: {status: :ok, message: "Task deleted successfully"}
    else
      render json: {task: task.errors, status: :no_content}
    end
  end
  
  def tasks_reminder
    tasks = current_user.tasks.all
    reminder_tasks = []
    tasks.each do |task|
      task_date = task.task_date.localtime
      if task_date.to_date == Time.now.to_date
        reminder_tasks << task
      end
    end
    respond_with(reminder_tasks) do |format|
      format.json { render :json => reminder_tasks.as_json }
      format.html
    end 
  end
  
  def get_shared_tasks
    shared_tasks = []
    current_user_shared_tasks = SharedTask.all.where(:user_id => current_user.id)
    current_user_shared_tasks.each do |shared_task|
      shared_tasks << Task.where(:id => shared_task.task_id).first
    end
    return shared_tasks
  end
  
  private 
  def task_params
    params.require(:task).permit(:id, :description, :user_id, :task_date, :status)
  end
end
