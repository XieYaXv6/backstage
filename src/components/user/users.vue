<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <!-- 头部搜索添加 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryinfo.query" clearable @clear="getuserlist">
            <el-button slot="append" icon="el-icon-search" @click="getuserlist"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="adddialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户信息列表 -->
      <el-table :data="userlist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态" prop="mg_state">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="statechange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showeditdialog(scope.row.id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeuserbyid(scope.row.id)"
            ></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setrole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryinfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryinfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="adddialogVisible" width="50%" @close="adddialogclosed">
      <span>
        <el-form :model="addform" :rules="addformrules" ref="addformref" label-width="70px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addform.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addform.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addform.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="addform.mobile"></el-input>
          </el-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="adddialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="adduser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户的对话框 
    prop是校验规则
    -->
    <el-dialog title="修改用户" :visible.sync="editdialogVisible" width="50%" @close="editdialogclose">
      <el-form :model="editform" :rules="editformrules" ref="editformref" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editform.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editform.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editform.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="edituserinfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="setroledialogVisible" width="50%" @close='setroleclose'>
      <div>
        <p>当前的用户：{{userinfo.username}}</p>
        <p>当前的角色：{{userinfo.role_name}}</p>
        <p>
          分配新角色：
          <el-select v-model="selectroleid" placeholder="请选择">
            <el-option
              v-for="item in rolelist"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setroledialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveroleinfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 邮箱手机号验证
    var checkemail = (rule, value, cb) => {
      const regemail = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
      // /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
      //"^[a-z0-9A-Z]+[- | a-z0-9A-Z . _]+@([a-z0-9A-Z]+(-[a-z0-9A-Z]+)?\\.)+[a-z]{2,}$"
      if (regemail.test(value)) {
        return cb();
      }
      cb(new Error("请输入合法的邮箱"));
    };

    var checkmobile = (rule, value, cb) => {
      const regmobile = /^1[3456789]\d{9}$/;

      if (regmobile.test(value)) {
        return cb();
      }
      cb(new Error("请输入合法的手机号"));
    };

    return {
      queryinfo: {
        query: "",
        pagenum: 1,
        pagesize: 2,
      },
      userlist: [],
      total: 0,
      adddialogVisible: false,
      editdialogVisible: false,
      addform: {
        username: "",
        password: "",
        email: "",
        mobile: "",
      },
      addformrules: {
        username: [
          { required: true, message: "请输入用户名称", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "长度在 3 到 10 个字符",
            trigger: "blur",
          },
        ],
        password: [
          { required: true, message: "请输入用户密码", trigger: "blur" },
          {
            min: 6,
            max: 15,
            message: "长度在 6 到 15 个字符",
            trigger: "blur",
          },
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkemail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入手机", trigger: "blur" },
          { validator: checkmobile, trigger: "blur" },
        ],
      },
      editform: {},
      editformrules: {
        email: [
          { required: true, message: "请输入用户邮箱", trigger: "blur" },
          { validator: checkemail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入用户手机", trigger: "blur" },
          { validator: checkmobile, trigger: "blur" },
        ],
      },
      setroledialogVisible: false,
      userinfo: {},
      rolelist: [],
      selectroleid:''
    };
  },
  created() {
    this.getuserlist();
  },
  methods: {
    // 获取用户信息
    async getuserlist() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryinfo,
      });
      if (res.meta.status !== 200)
        return this.$message.error("获取用户列表失败！");
      this.userlist = res.data.users;
      this.total = res.data.total;
    },
    // 每页显示多少个用户
    handleSizeChange(newsize) {
      //console.log(newsize);
      this.queryinfo.pagesize = newsize;
      this.getuserlist();
    },
    // 总页数
    handleCurrentChange(newpage) {
      //console.log(newpage);
      this.queryinfo.pagenum = newpage;
      this.getuserlist();
    },
    // 修改用户状态
    async statechange(userinfo) {
      //console.log(userinfo);
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      );
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state;
        return this.$message.error("更新用户状态失败！");
      }
      this.$message.success("更新用户状态成功！");
    },
    //关闭添加用户
    adddialogclosed() {
      this.$refs.addformref.resetFields();
    },
    // 添加用户
    adduser() {
      this.$refs.addformref.validate(async (valid) => {
        //console.log(valid)
        if (!valid) return;
        const { data: res } = await this.$http.post("users", this.addform);
        if (res.meta.status !== 201) {
          return this.$message.error("添加用户失败！");
        }
        this.$message.success("添加用户成功！");
        this.adddialogVisible = false;
        this.getuserlist();
      });
    },
    //根据id查询用户
    async showeditdialog(id) {
      //console.log(id)
      const { data: res } = await this.$http.get("users/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("查询用户信息失败！");
      }

      this.editform = res.data;
      this.editdialogVisible = true;
    },
    //关闭修改用户对话框
    editdialogclose() {
      this.$refs.editformref.resetFields();
    },
    //提交修改用户信息请求
    edituserinfo() {
      //表单预校验
      this.$refs.editformref.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          "users/" + this.editform.id,
          {
            email: this.editform.email,
            mobile: this.editform.mobile,
          }
        );
        if (res.meta.status !== 200)
          return this.$message.error("更新用户信息失败！");

        this.editdialogVisible = false;
        this.getuserlist();
        this.$message.success("更新用户信息成功！");
      });
    },
    //删除用户
    async removeuserbyid(id) {
      const result = await this.$confirm(
        "此操作将永久删除该用户, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => {
        return err;
      });

      if (result !== "confirm") {
        return this.$message.info("已取消删除");
      }

      const { data: res } = await this.$http.delete("users/" + id);

      if (res.meta.status !== 200) {
        return this.$message.error("删除用户失败！");
      }

      this.$message.success("删除用户成功！");
      this.getuserlist();
    },
    async setrole(userinfo) {
      this.userinfo = userinfo;

      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败！");
      }

      this.rolelist = res.data;
      this.setroledialogVisible = true;
    },
    async saveroleinfo(){
      if(!this.selectroleid){
        this.$message.error('请选择要分配的角色！')
      }
      const {data:res}= await this.$http.put(`users/${this.userinfo.id}/role`,{rid:this.selectroleid})
      if(res.meta.status!==200){
        return this.$message.error('更新角色失败！')
      }
      this.$message.success('更新角色成功！')
      this.getuserlist()
      this.setroledialogVisible=false
    },
    setroleclose(){
      thos.selectroleid=''
      this.userinfo={}
    }
  },
};
</script>

<style>
</style>