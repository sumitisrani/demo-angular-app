class SharedTasksController < ApplicationController

  def create
    shared_task = SharedTask.new(shared_task_params)
    if shared_task.save
      render json: { shared_task: shared_task.as_json, status: :ok, message: "Share task created" }
    else
      render json: {task: shared_task.errors, status: :no_content}
    end  
  end
  
  def remove
    shared_task =  SharedTask.where(:task_id=>shared_task_params[:task_id],:user_id=>shared_task_params[:user_id]).first
    if shared_task.destroy
      render json: {shared_task: shared_task, status: :ok, message: "Shared task removed"}
    else
      render json: {shared_task: shared_task.errors, status: :no_content}
    end
  end
  
  private
  def shared_task_params
    params.require(:shared_task).permit(:task_id, :user_id)
  end
end
