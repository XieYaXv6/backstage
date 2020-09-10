<template>
  <el-container class="container">
    <!-- 头部 -->
    <el-header>
      <span>电商后台管理系统</span>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>

    <!-- 主体 -->
    <el-container>
      <!-- 侧边栏收缩或放大 -->
      <el-aside :width="iscollapse?'64px':'200px'">
        <div class="togglebtn" @click="toggle">|||</div>
        <!-- 侧边栏 -->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#50D2F3"
          unique-opened
          
          :collapse="iscollapse"
          :collapse-transition="false"
          :router="true"
          :default-active="activepath"
        >
          <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
            <template slot="title">
              <i :class="icons[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/'+subitem.path"
              v-for="subitem in item.children"
              :key="subitem.id"
              
              @click="savenavstate('/'+subitem.path)"
            >
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subitem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>

      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menulist: [],
      icons: {
        125: "el-icon-user-solid",
        103: "el-icon-s-cooperation",
        101: "el-icon-s-shop",
        102: "el-icon-s-order",
        145: "el-icon-s-data",
      },
      iscollapse: false,
      activepath: "",
    };
  },
  created() {
    this.getMenuList();
    this.activepath = window.sessionStorage.getItem("activepath");
  },
  methods: {
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    async getMenuList() {
      //获取侧边栏列表
      const { data: res } = await this.$http.get("menus");
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      
      this.menulist = res.data;
     
      //console.log(this.menulist);
    },
    //侧边栏收缩
    toggle() {
      this.iscollapse = !this.iscollapse;
    },
    //记录当前选中的列表项
    savenavstate(activepath) {
      window.sessionStorage.setItem("activepath", activepath);
      this.activepath = activepath;
    },
  },
};
</script>

<style lang="less" scoped>
.container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;

  align-items: center;
  color: #fff;
  font-size: 20px;
  > span {
    display: flex;
    align-items: center;
  }
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: #eaedf1;
}
.togglebtn {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>