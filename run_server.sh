# 启动本地预览服务器（支持热重载）
# 用法：在项目根目录下运行以下命令：
#
#   bash run_server.sh
#
# 启动后访问：http://localhost:4000

export PATH="/d/programs/ruby/install/Ruby33-x64/bin:$PATH"

bundle exec jekyll liveserve
